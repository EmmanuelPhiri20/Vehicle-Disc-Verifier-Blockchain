import React, { useState, useEffect } from 'react';
import walletService from '../wallet/connect';
import licenseService from '../services/licenseService';
import transactionHandler from '../transactions/transactionHandler';

function IssueLicenseForm() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [isRTSA, setIsRTSA] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    year: new Date().getFullYear(),
    roadTaxReference: '',
    insuranceReference: '',
    fitnessReference: '',
    ownerName: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    checkWalletStatus();
  }, []);

  const checkWalletStatus = async () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      const connected = await walletService.connectWallet();
      if (connected.success) {
        setWalletConnected(true);
        const rtsa = await walletService.isRTSA();
        setIsRTSA(rtsa);
        licenseService.setContract(walletService.contract);
      }
    }
  };

  const connectWallet = async () => {
    const result = await walletService.connectWallet();
    if (result.success) {
      setWalletConnected(true);
      const rtsa = await walletService.isRTSA();
      setIsRTSA(rtsa);
      licenseService.setContract(walletService.contract);
    } else {
      alert(result.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isRTSA) {
      alert("Only RTSA officers can issue licenses");
      return;
    }
    
    setSubmitting(true);
    setResult(null);
    
    const response = await licenseService.issueLicense(formData);
    
    if (response.success) {
      setResult({
        success: true,
        transactionHash: response.transactionHash,
        licenseHash: response.licenseHash
      });
      
      // Track transaction
      transactionHandler.addPendingTransaction(response.transactionHash, {
        type: 'ISSUE_LICENSE',
        vehicleNumber: formData.vehicleNumber
      });
      
      // Reset form
      setFormData({
        vehicleNumber: '',
        year: new Date().getFullYear(),
        roadTaxReference: '',
        insuranceReference: '',
        fitnessReference: '',
        ownerName: ''
      });
    } else {
      setResult({
        success: false,
        error: response.error
      });
    }
    
    setSubmitting(false);
  };

  if (!walletConnected) {
    return (
      <div>
        <h2>Issue New License</h2>
        <button onClick={connectWallet}>Connect MetaMask</button>
        <p>Only RTSA officers can issue licenses</p>
      </div>
    );
  }

  if (!isRTSA) {
    return (
      <div>
        <h2>Unauthorized</h2>
        <p>Only RTSA officers can access this page</p>
        <p>Connected account: {walletService.currentAccount}</p>
        <p>Expected RTSA: {walletService.contract?.rtsaAuthority()}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Issue New License Disc</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Vehicle Number:</label>
          <input
            type="text"
            value={formData.vehicleNumber}
            onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
            required
            placeholder="e.g., ABL 1234"
          />
        </div>
        
        <div>
          <label>Owner Name:</label>
          <input
            type="text"
            value={formData.ownerName}
            onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label>Year:</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
            required
          />
        </div>
        
        <div>
          <label>Road Tax Reference:</label>
          <input
            type="text"
            value={formData.roadTaxReference}
            onChange={(e) => setFormData({...formData, roadTaxReference: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label>Insurance Reference:</label>
          <input
            type="text"
            value={formData.insuranceReference}
            onChange={(e) => setFormData({...formData, insuranceReference: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label>Fitness Test Reference:</label>
          <input
            type="text"
            value={formData.fitnessReference}
            onChange={(e) => setFormData({...formData, fitnessReference: e.target.value})}
            required
          />
        </div>
        
        <button type="submit" disabled={submitting}>
          {submitting ? 'Processing...' : 'Issue License'}
        </button>
      </form>
      
      {result && (
        <div>
          <h3>Result:</h3>
          {result.success ? (
            <div style={{color: 'green'}}>
              <p>✅ License issued successfully!</p>
              <p>Transaction: {result.transactionHash}</p>
              <p>License Hash: {result.licenseHash}</p>
            </div>
          ) : (
            <div style={{color: 'red'}}>
              <p>❌ Failed: {result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IssueLicenseForm;