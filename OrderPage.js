import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderPage.css';

const OrdersPage = ({ onAddToCart }) => {
    const [participantName, setParticipantName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedNodes, setSelectedNodes] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [labFacility, setLabFacility] = useState('');
    const [selectedLibrary, setSelectedLibrary] = useState(null); // Store only one selected library
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const planDetails = {
        shortTermInitiative: { baseAmount: 1000, duration: 10 },
        longTermInitiative: { baseAmount: 5000, duration: 30 },
    };

    // Library Information
    const libraryInfo = {
        OpenMP: 'OpenMP is a parallel programming model for shared memory systems.',
        MPI: 'MPI is a standard for parallel programming in distributed memory systems.',
        CUDA: 'CUDA is a parallel computing platform and programming model for Nvidia GPUs.',
        SYCL: 'SYCL is a C++ programming model for heterogeneous computing systems.'
    };

    useEffect(() => {
        if (selectedPlan) {
            const updatedEndDate = new Date(startDate);
            updatedEndDate.setDate(
                updatedEndDate.getDate() + planDetails[selectedPlan].duration * quantity
            );
            setEndDate(updatedEndDate);
        }
    }, [startDate, selectedPlan, quantity]);

    const handlePlanSelection = (plan) => {
        setSelectedPlan(plan);
        setSelectedNodes(null); // Reset node selection on plan change
    };

    const handleNodeChange = (event) => {
        setSelectedNodes(Number(event.target.value));
    };

    const handleLibrarySelection = (event) => {
        const { value, checked } = event.target;
        if (checked) {
            setSelectedLibrary(value); // Only store one selected library
        } else {
            setSelectedLibrary(null); // Deselect if unchecked
        }
    };

    const calculateAmount = () => {
        if (selectedPlan && selectedNodes) {
            return planDetails[selectedPlan].baseAmount * selectedNodes * quantity;
        }
        return 0;
    };

    const handleAddToCart = () => {
        if (!participantName.trim() || !selectedPlan || !selectedNodes) {
            alert('Please fill all required fields.');
            return;
        }
        const item = {
            amount: calculateAmount(),
            duration: planDetails[selectedPlan].duration * quantity,
            participantName,
            quantity,
            selectedNodes,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            labFacility,
            selectedLibrary,
            file,
        };
        onAddToCart(item);
    };

    const handleFileUpload = (event) => {
        setFile(event.target.files[0]);
    };

    const handlePayment = async () => {
        if (!participantName.trim()) {
            alert('Please enter the participant name.');
            return;
        }
        try {
            setLoading(true);
            // Payment logic here
        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="orderpage-container">
            {/* Left Side: Show Pricing Plans or Selected Plan Details */}
            <div className="left-panel">
                {!selectedPlan ? (
                    <div className="pricing-section">
                        <h2>Pricing Plans</h2>
                        <div className="pricing-cards">
                            <div
                                className="pricing-card"
                                onClick={() => handlePlanSelection('shortTermInitiative')}
                            >
                                <h3>Short Term Initiative</h3>
                            </div>
                            <div
                                className="pricing-card"
                                onClick={() => handlePlanSelection('longTermInitiative')}
                            >
                                <h3>Long Term Initiative</h3>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="selected-plan-details">
                        <h2>
                            {selectedPlan === 'shortTermInitiative' ? 'Short Term Initiative' : 'Long Term Initiative'}
                        </h2>
                        <button className="change-plan" onClick={() => setSelectedPlan(null)}>
                            Change Plan
                        </button>
                    </div>
                )}
            </div>

            {/* Right Side: Show Order Details */}
            {selectedPlan && (
                <div className="order-details">
                    <div className="card">
                        <h3>Select Nodes</h3>
                        <div className="node-selection">
                            <label>
                                <input
                                    type="radio"
                                    value={2}
                                    checked={selectedNodes === 2}
                                    onChange={handleNodeChange}
                                />
                                2 Nodes
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value={4}
                                    checked={selectedNodes === 4}
                                    onChange={handleNodeChange}
                                />
                                4 Nodes
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value={6}
                                    checked={selectedNodes === 6}
                                    onChange={handleNodeChange}
                                />
                                6 Nodes
                            </label>
                        </div>
                    </div>

                    <div className="card">
                        <h3>Participant Details</h3>
                        <input
                            type="text"
                            placeholder="Enter Participant Name"
                            value={participantName}
                            onChange={(e) => setParticipantName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Enter lab facility details"
                            value={labFacility}
                            onChange={(e) => setLabFacility(e.target.value)}
                        />
                        <input type="file" onChange={handleFileUpload} />
                    </div>

                    <div className="card">
                        <h3>Select Libraries</h3>
                        <div className="libraries">
                            <label>
                                <input
                                    type="checkbox"
                                    value="OpenMP"
                                    onChange={handleLibrarySelection}
                                />
                                OpenMP
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    value="MPI"
                                    onChange={handleLibrarySelection}
                                />
                                MPI
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    value="CUDA"
                                    onChange={handleLibrarySelection}
                                />
                                CUDA
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    value="SYCL"
                                    onChange={handleLibrarySelection}
                                />
                                SYCL
                            </label>
                        </div>

                        {/* Show only the selected library's information */}
                        <div className="library-info">
                            {selectedLibrary && (
                                <div className="info-item">
                                    <h4>{selectedLibrary}</h4>
                                    <p>{libraryInfo[selectedLibrary]}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card summary">
                        <p>Amount: ₹{calculateAmount()}</p>
                        <p>Duration: {selectedPlan ? planDetails[selectedPlan].duration * quantity : 0} days</p>
                        <p>Start Date: {startDate.toISOString().split('T')[0]}</p>
                        <p>End Date: {endDate.toISOString().split('T')[0]}</p>
                    </div>

                    <button onClick={handleAddToCart}>Add to Cart</button>
                    <button onClick={handlePayment} disabled={loading}>
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
