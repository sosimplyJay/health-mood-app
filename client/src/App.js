import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email domain
        const emailPattern = /@(spelman\.edu|morehouse\.edu)$/;
        if (!emailPattern.test(email)) {
            setMessage('Email must end with @spelman.edu or @morehouse.edu.');
            return;
        }

        try {
            const response = await axios.post('/submit', { name, email });
            setMessage(response.data.message);
            setIsEmailSent(true); // Show verification step
        } catch (error) {
            setMessage('Error saving user to database');
        }
    };

    const handleVerifyEmail = async () => {
        try {
            const response = await axios.post('/verify', { email, verificationCode });
            setMessage(response.data.message);
            if (response.data.success) {
                setIsVerified(true);
            }
        } catch (error) {
            setMessage('Invalid verification code.');
        }
    };

    return (
        <div className="App">
            <h1>Enter Your Info</h1>
            {!isEmailSent ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Submit</button>
                </form>
            ) : !isVerified ? (
                <div>
                    <h2>Verify Your Email</h2>
                    <label>Enter Verification Code</label>
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                    />
                    <button onClick={handleVerifyEmail}>Verify</button>
                </div>
            ) : (
                <h2>Email Verified Successfully!</h2>
            )}
            {message && <p>{message}</p>}
        </div>
    );
}

export default App;
