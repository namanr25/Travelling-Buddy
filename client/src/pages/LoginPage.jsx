
import axios from "axios";
import { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const { setUser } = useContext(UserContext);

    async function handleLoginSubmit(ev) {
        ev.preventDefault();
        try {
            const response = await axios.post('https://travelling-buddy.onrender.com/login', { email, password });

            console.log("Login Response:", response.data); //Debugging log

            if (response.data.token) {
                localStorage.setItem("token", response.data.token); //Store the JWT Token
                setUser(response.data.user); //Store user data in context
                alert("Login Successful");
                setRedirect(true);
            } else {
                alert("Login failed: No token received");
            }
        } catch (e) {
            console.error("Login error:", e.response?.data || e);
            alert("Login failed");
        }
    }

    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mb-4">Login</h1>
                <form className="max-w-lg mx-auto" onSubmit={handleLoginSubmit}>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={ev => setEmail(ev.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={ev => setPassword(ev.target.value)}
                    />
                    <button className="primary">Login</button>
                    <div className="text-center py-2 text-gray-500">
                        Don't have an account yet? <Link className="underline text-black" to="/register">Register now</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
