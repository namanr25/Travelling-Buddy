import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [addressLine3, setAddressLine3] = useState('');
    const [profession, setProfession] = useState('');
    const [age, setAge] = useState('');
    const [socialMediaID, setSocialMediaID] = useState('');

    async function registerUser(ev) {
        ev.preventDefault();
        try {
            await axios.post('/register', {
                name,
                email,
                password,
                phone,
                addressLine1,
                addressLine2,
                addressLine3,
                profession,
                age,
                socialMediaID: socialMediaID
            });
            alert('Registration Successful. Now you can log in');
        } catch (e) {
            alert('Registration failed. Please try again later.');
        }
    }

    return (
       <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mb-4">Register</h1>  
                <form className="max-w-lg mx-auto" onSubmit={registerUser}>
                    <input type="text" placeholder="Your Name" value={name} onChange={ev => setName(ev.target.value)} required />
                    <input type="email" placeholder="your@email.com" value={email} onChange={ev => setEmail(ev.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={ev => setPassword(ev.target.value)} required />
                    <input type="tel" placeholder="Phone Number" value={phone} onChange={ev => setPhone(ev.target.value)} required />
                    <input type="text" placeholder="Address Line 1" value={addressLine1} onChange={ev => setAddressLine1(ev.target.value)} />
                    <input type="text" placeholder="Address Line 2" value={addressLine2} onChange={ev => setAddressLine2(ev.target.value)} />
                    <input type="text" placeholder="Address Line 3" value={addressLine3} onChange={ev => setAddressLine3(ev.target.value)} />
                    <input type="text" placeholder="Profession" value={profession} onChange={ev => setProfession(ev.target.value)} />
                    <input type="number" placeholder="Age" value={age} onChange={ev => setAge(ev.target.value)} min="18" />
                    <input type="text" placeholder="Social Media ID" value={socialMediaID} onChange={ev => setSocialMediaID(ev.target.value)} />
                    <button className="primary">Register</button>
                    <div className="text-center py-2 text-gray-500">
                        Already a member? <Link className="underline text-black" to={'/login'}>Login</Link>
                    </div>
                </form>
            </div>
       </div>
    );
}