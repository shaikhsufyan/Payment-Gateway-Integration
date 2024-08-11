import React, { useState } from "react";
import axios from "axios"
const Form = () => {
  const [data, setData] = useState({ name: "", number: "", amount: "" });
  // const [amount, setAmount] = useState();

  const handleInput = (e) => {
    console.log(e.target.value);
    let name = e.target.name;
    let value = e.target.value;
    setData({ ...data, [name]: value });
    // setAmount(e.target.value)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:8000/pay", data)
    .then(response=>{
        console.log(response.data.data.instrumentResponse.redirectInfo.url);
        const url = response.data.data.instrumentResponse.redirectInfo.url
        window.location.href=response.data.data.instrumentResponse.redirectInfo.url;
        
    })
    .catch(err=>{
        console.log("Frontend : ",err);
        
    })

    // try {
    //   e.preventDefault();
    //   console.log(data);

    //   const response = await fetch("/pay", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(data),
       

    //   });

    //   console.log(response);
    // } catch (err) {
    //   console.log("ERROR : ", err);
    // }

  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        onChange={handleInput}
        placeholder="Enter Name"
      />

      <input
        type="text"
        name="number"
        onChange={handleInput}
        placeholder="Enter Mobile Number"
      />
      <input
        type="text"
        name="amount"
        onChange={handleInput}
        placeholder="Enter Amount"
      />
      <button onClick={handleSubmit}>Pay</button>
    </form>
  );
};

export default Form;
