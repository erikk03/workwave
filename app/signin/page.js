import React from 'react';

export default function SignIn() {
    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission logic here
    };

    return (
        <div className="container">
            <h1 className="title">Sign In Page</h1>
            <div className="center" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <form className="form" style={{ textAlign: "center" }}>
                    <label htmlFor="email" className="label">Email:</label>
                    <input type="email" id="email" name="email" className="input" />

                    <label htmlFor="password" className="label">Password:</label>
                    <input type="password" id="password" name="password" className="input" />

                    <button type="submit" className="button">Sign In</button>
                </form>
            </div>
        </div>
    );
}