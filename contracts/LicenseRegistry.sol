// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LicenseRegistry {
    
    address public rtsaAuthority;
    
    // Add tracking for multiple officers
    mapping(address => bool) public authorizedOfficers;
    
    struct License {
        string vehicleNumber;
        uint256 year;
        bytes32 licenseHash;
        string roadTaxReference;   // Reference number for road tax
        string insuranceReference;  // Reference number for insurance
        string fitnessReference;    // Reference number for fitness test
        bool revoked;
        uint256 issuedTime;
        uint256 expiryDate;        // When the license expires
        string metadata;            // Additional data (JSON string for QR code data)
    }
    
    mapping(bytes32 => License) private licenses;
    
    // Track licenses by vehicle number for quick lookup
    mapping(string => bytes32[]) private vehicleLicenses;
    
    event LicenseIssued(
        bytes32 indexed licenseHash, 
        string vehicleNumber, 
        uint256 year,
        uint256 expiryDate
    );
    event LicenseRevoked(bytes32 indexed licenseHash, string reason);
    event OfficerAuthorized(address indexed officer);
    event OfficerDeauthorized(address indexed officer);
    
    modifier onlyRTSA() {
        require(
            msg.sender == rtsaAuthority || authorizedOfficers[msg.sender],
            "Only RTSA can perform this action"
        );
        _;
    }
    
    constructor() {
        rtsaAuthority = msg.sender;
        authorizedOfficers[msg.sender] = true;
    }
    
    // Add/remove authorized officers
    function authorizeOfficer(address officer) public onlyRTSA {
        require(officer != address(0), "Invalid address");
        authorizedOfficers[officer] = true;
        emit OfficerAuthorized(officer);
    }
    
    function deauthorizeOfficer(address officer) public onlyRTSA {
        require(officer != rtsaAuthority, "Cannot deauthorize main authority");
        authorizedOfficers[officer] = false;
        emit OfficerDeauthorized(officer);
    }
    
    function issueLicense(
        string memory vehicleNumber,
        uint256 year,
        bytes32 licenseHash,
        string memory roadTaxReference,
        string memory insuranceReference,
        string memory fitnessReference,
        uint256 validityDays, // e.g., 365 days
        string memory metadata
    ) public onlyRTSA {
        
        require(licenses[licenseHash].licenseHash == 0, "License already exists");
        require(bytes(vehicleNumber).length > 0, "Vehicle number required");
        require(year > 0, "Valid year required");
        
        uint256 issuedTime = block.timestamp;
        uint256 expiryDate = issuedTime + (validityDays * 1 days);
        
        licenses[licenseHash] = License({
            vehicleNumber: vehicleNumber,
            year: year,
            licenseHash: licenseHash,
            roadTaxReference: roadTaxReference,
            insuranceReference: insuranceReference,
            fitnessReference: fitnessReference,
            revoked: false,
            issuedTime: issuedTime,
            expiryDate: expiryDate,
            metadata: metadata
        });
        
        // Index by vehicle number for lookup
        vehicleLicenses[vehicleNumber].push(licenseHash);
        
        emit LicenseIssued(licenseHash, vehicleNumber, year, expiryDate);
    }
    
    function revokeLicense(bytes32 licenseHash, string memory reason) public onlyRTSA {
        require(licenses[licenseHash].licenseHash != 0, "License not found");
        require(!licenses[licenseHash].revoked, "License already revoked");
        
        licenses[licenseHash].revoked = true;
        
        emit LicenseRevoked(licenseHash, reason);
    }
    
    function verifyLicense(bytes32 licenseHash)
        public
        view
        returns (
            string memory vehicleNumber,
            uint256 year,
            bool isValid,
            bool isRevoked,
            bool isExpired,
            uint256 issuedTime,
            uint256 expiryDate,
            string memory metadata
        )
    {
        License memory license = licenses[licenseHash];
        
        require(license.licenseHash != 0, "License does not exist");
        
        bool expired = (block.timestamp > license.expiryDate);
        
        return (
            license.vehicleNumber,
            license.year,
            (!license.revoked && !expired), // isValid = not revoked AND not expired
            license.revoked,
            expired,
            license.issuedTime,
            license.expiryDate,
            license.metadata
        );
    }
    
    // Get all licenses for a vehicle (historical + current)
    function getVehicleLicenses(string memory vehicleNumber)
        public
        view
        returns (bytes32[] memory)
    {
        return vehicleLicenses[vehicleNumber];
    }
    
    // Check if a license is currently valid
    function isLicenseValid(bytes32 licenseHash) public view returns (bool) {
        License memory license = licenses[licenseHash];
        if (license.licenseHash == 0) return false;
        return (!license.revoked && block.timestamp <= license.expiryDate);
    }
}