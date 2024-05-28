import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { IoIosCloseCircle, IoIosCheckmarkCircle   } from "react-icons/io";
import { FaTrashAlt, FaEdit  } from "react-icons/fa";
import ErrorModal from '../components/ErrorModal';
import SuccessModal from '../components/SuccessModal';

const EvaluationForm = () => {
    const [questions, setQuestions] = useState({
        rating: [], comment: []
    })
    const [instruction, setInstruction] = useState("")
    const [addQuestion, setAddQuestion] = useState("rating")
    const [errorMesage, setErrorMessage] = useState("")

    const handleAddQuestion = () => {
        const uid = new Date().toISOString();
        
        if (addQuestion === "rating") {
            setQuestions((prev) => ({
                ...prev,
                rating: [...prev.rating, {
                    questionId: uid,
                    question: "",
                    answers: ["1","2", "3", "4", "5"],
                    saved: false
                }]
            }));
        } else if (addQuestion === "comment") {
            setQuestions((prev) => ({
                ...prev,
                comment: [...prev.comment, {
                    questionId: uid, 
                    comment: "",
                    saved: false
                }],
            }));
        }
    };

    useEffect(() => {
        console.log(questions.rating);
    }, [questions])


    const Question = ({questionData}) => {
        const {questionId, saved, question} = questionData
        const [text, setText] = useState(question)

        const handleSave = () => {
            if (!text || text === "") {
                setErrorMessage("Invalid Question.");
                return;
            }
        
            // Find the index of the question with the matching questionId
            const questionIndex = questions.rating.findIndex((q) => q.questionId === questionId);
        
            // If the question with the given questionId is found
            if (questionIndex !== -1) {
                // Create a copy of the questions array
                const updatedQuestions = [...questions.rating];
                
                // Update the question at the found index
                updatedQuestions[questionIndex] = {
                    ...updatedQuestions[questionIndex],
                    question: text,
                    saved: true, 
                    disabled: true
                };
        
                // Update the state with the updated questions array
                setQuestions({ ...questions, rating: updatedQuestions });
            } else {
                // Handle the case when the question with the given questionId is not found
                console.error("Question not found with ID:", questionId);
            }
        };


        const handleDelete = () => {
            const updatedQuestion = [...questions.rating];
console.log(updatedQuestion);
            const newQuestions = updatedQuestion.filter((q) => q.questionId != questionId)
console.log(newQuestions);
            setQuestions({...questions, rating: newQuestions || []})

        }
        
        


        return (
            <QuestionField>
                <div className="icons">
                {!saved && <IoIosCloseCircle className='icon'  onClick={handleDelete}/>}
                {saved && <FaTrashAlt className='icon' onClick={handleDelete} />}
                {!saved && <IoIosCheckmarkCircle  className='icon' onClick={handleSave}/>}
                {saved && <FaEdit  className='icon' />}

                </div>
                <Input placeholder='Add Short Question' required maxLength={150} value={text}  onChange={(e) => setText(e.target.value)} />
                <QuestionInput>
                    <RadioInput>
                        <input type="radio" disabled id="rating1" name="rating" value="1" />
                        <label htmlFor="1">Outstanding</label>
                    </RadioInput>
    
                    <RadioInput>
                        <input type="radio" disabled id="rating2" name="rating" value="2" />
                        <label htmlFor="2">Very good</label>
                    </RadioInput>
    
                    <RadioInput>
                        <input type="radio" disabled id="rating3" name="rating" value="3" />
                        <label htmlFor="3">Good</label>
                    </RadioInput>
    
                    <RadioInput>
                        <input type="radio" disabled id="rating4" name="rating" value="4" />
                        <label htmlFor="4">Fair</label>
                    </RadioInput>
    
                    <RadioInput>
                        <input type="radio" disabled id="rating5" name="rating" value="5" />
                        <label htmlFor="5">Slightly fair</label>
                    </RadioInput>
                </QuestionInput>
            </QuestionField>
        );
    }


  return (
    <Container>

        <AddFormModal>
            <Title>Create Event Evaluation</Title>
            <div>
                <Direction placeholder='Write Short Instruction' required value={instruction} onChange={(e) => setInstruction(e.target.value)} />
                <span>{200 - instruction.length} characters</span>
            </div>

            {questions?.rating.length > 0 && questions.rating.map((q) => (
                <Question key={q.questionId} questionData={q} />
            ))}


           <AddQuestion>
            <p>Add Question</p>
            <div className="selectWrapper">
<button type='button' onClick={handleAddQuestion}>+</button>
            <select value={addQuestion} onChange={(e) => setAddQuestion(e.target.value)}>
                <option value="rating">Rating</option>
                <option value="comment">Comment</option>
            </select>
            </div>
           </AddQuestion>
        </AddFormModal>


{errorMesage && <ErrorModal message={errorMesage} onClose={()=> setErrorMessage(null)} />}
    </Container>
  )
}

export default EvaluationForm
const Container = styled.div`
    display: flex;
    justify-content: center;
`

const AddFormModal = styled.form`
    flex: 1;
    max-width: 800px;
    margin: 1em 0;
    height: fit-content;
    max-height: 100%;
    overflow-y: scroll;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.7);
    border-radius: 1em;
    padding: 1em;


    &::-webkit-scrollbar{
        display: none;
    }
`

const Title = styled.p`
    font-size: 1.2rem;
    margin-bottom: 1em;
    font-weight: 600
`


const Direction = styled.textarea`
    width: 100%;
    height: 100px;
    resize: none;
    padding: 1em;
    border: none;
    outline: none;
    box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.7);
    border-radius: 0.5em;
    font-size: 1rem;
`

const AddQuestion = styled.div`
margin-top: 1em;
display: flex;
flex-direction: column;
align-items: flex-end;


& p{
    font-size: 0.9rem;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 0.2em;
}


& .selectWrapper {
    display: flex;
    gap: 0.5em;

    & button{
        font-size: 1.2rem;
        padding: 0.4em 1em;
        border: none;
        otline: none;
        background: dodgerblue;
        color: white;
        cursor: pointer;


        &:hover{
            background: red;
        }
    }


    & select{
        padding: 0.4em 1em;
    font-size: 0.9rem;
    border: none;
    otline: none;
    background: dodgerblue;
    color: white;
    cursor: pointer;


    &:hover{
        background: red;
    }
    }
}
`


const QuestionField = styled.div`
    margin: 1em 0;
    box-shadow: 0px 0px 3px 0px rgba(0,0,0.6);
    padding: 1em;
    position: relative;

    & .icons{
        position: absolute;
        top: 0.3em;
        right: 0.5em;
        display: flex;
        align-items: center;
        gap: 1em;


        & .icon{
            font-size: 1.5rem;
            color: green;
            cursor: pointer;
            

            &:hover{
                color: red;
            }
        }
    }



`

const Input = styled.input`
    width: 100%;
    padding: 1em;
    font-size: 1rem;
    outline: none;
    border:none;
    border-bottom: 2px solid dodgerblue;
    display: inline-block;
    margin-bottom: 0.5em;
`

const QuestionInput = styled.div`
    display: flex;
    flex-direction: column;
`;

const RadioInput = styled.div`
    margin-bottom: 0.5rem; /* Adjust spacing between radio button inputs */
    display: flex;
    gap: 1em;
    padding-left: 1em;
`;

const Radio = styled.input``;