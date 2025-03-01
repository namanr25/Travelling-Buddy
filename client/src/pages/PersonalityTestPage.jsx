import { useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import { UserContext } from "../UserContext";

export default function PersonalityTestPage() {
    const { user } = useContext(UserContext);
    const questions = [
        "I am the life of the party.", "I feel comfortable around people.", "I start conversations.", "I talk to a lot of different people at parties.", "I don't mind being the center of attention.",
        "I get stressed out easily.", "I worry about things.", "I get upset easily.", "I have frequent mood swings.", "I get irritated easily.",
        "I am interested in people.", "I sympathize with others' feelings.", "I have a soft heart.", "I take time out for others.", "I make people feel at ease.",
        "I am always prepared.", "I pay attention to details.", "I get chores done right away.", "I like order.", "I follow a schedule.",
        "I have a rich vocabulary.", "I have a vivid imagination.", "I have excellent ideas", "I am quick to understand things.", "I spend time reflecting on things."
    ];

    const [responses, setResponses] = useState(Array(questions.length).fill(null));
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    function handleResponseChange(index, value) {
        const updatedResponses = [...responses];
        updatedResponses[index] = value;
        setResponses(updatedResponses);
        setError(false);
    }

    async function handleSubmit() {
        if (responses.includes(null)) {
            setError(true);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post("/submit-personality-test", { responses });
            setResult(response.data.personalityCategory);
        } catch (err) {
            console.error("Error submitting personality test:", err);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-gray-300">
            <h1 className="text-3xl font-bold mb-4 text-center">Personality Test</h1>
            <p className="text-gray-700 mb-6 text-center">
                Welcome to the Personality Test! This test will help you understand your key personality traits. 
                Answer the following 25 questions honestly by selecting a response from 1 (Strongly Disagree) to 5 (Strongly Agree). 
                Your results will help match you with like-minded travelers!
            </p>
            
            {result ? (
                <div className="text-center p-6 bg-green-100 border border-green-400 rounded-md">
                    <h2 className="text-2xl font-semibold text-green-700">Your Personality Category:</h2>
                    <p className="text-lg font-bold mt-2 text-green-800">{result}</p>
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {questions.map((question, index) => (
                            <div key={index} className="p-4 border rounded-md bg-gray-50 shadow-md">
                                <p className="text-lg font-medium mb-2">{index + 1}. {question}</p>
                                <div className="flex justify-between">
                                    {[1, 2, 3, 4, 5].map((option) => (
                                        <label key={option} className="flex items-center gap-2 font-bold text-lg cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`question-${index}`}
                                                value={option}
                                                checked={responses[index] === option}
                                                onChange={() => handleResponseChange(index, option)}
                                                className="hidden"
                                            />
                                            <span className={`px-4 py-2 rounded-md ${responses[index] === option ? 'bg-primary text-white' : 'bg-gray-200'}`}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {error && <p className="text-red-500 text-center mt-4">Please answer all questions before submitting.</p>}
                    
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold transition ${loading ? 'bg-gray-400' : 'bg-primary text-white hover:bg-blue-700'}`}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </>
            )}
        </div>
    );
}