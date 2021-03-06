import React, { Component } from 'react';
import './style.css';
import { NavLink } from 'react-router-dom';
import Header from '../elements/header';
import DashboardTeacher from '../LoginedTeacherDash/index';

export default class Tlogin extends Component {
  constructor(props) {
    super(props);
    this.clearToken = this.clearToken.bind(this);
}

  state = {
    username: "",
    password: "",
    token: "",
    accountType: "TEACHER"
}

clearToken() {
  this.setState({
    token: null
  })
}

login = () => {
    const data = {
        "username": this.state.username,
        "password": this.state.password,
        "login_type": this.state.accountType
    };
    fetch("https://oktatoappapi.herokuapp.com/OktatoAppAPI/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(responsejson => {
      if (responsejson.status_code === "201" || responsejson.status_code === "200")
        {this.setState({
            username: responsejson.data[0].username,
            token: responsejson.data[0].token
        });
      }
      else
      {alert("Wrong username or password!");}
    });
} 
 
handleUserName(text)
{
  this.setState({username:text.target.value})
}
 
handlePassword(text)
{
  this.setState({password:text.target.value})
}
  
  render() {
    if(!this.state.token){
   return (
       <React.Fragment>
        <Header />
      <div className="divbox">
        <h1 className="defaultColor header">Teacher Login</h1>
          <div className="input-container">
            <i className="iconBg"></i>
            <i className="userIcon icon"></i>
            <input className="input-field" type="text" placeholder="Username" onChange={(text) => {this.handleUserName(text)}} />
          </div>
          <div className="input-container">
            <i className="iconBg"></i>
            <i className="passIcon icon"></i>
            <input className="input-field" type="password" placeholder="Password" onChange={(text) => {this.handlePassword(text)}} />
          </div>
          <div>
            <button className="defaultColor button" onClick={()=>{this.login()}}>Login</button>
            <NavLink to="/register/teacher"><button className="defaultColor button">Register</button></NavLink>
            <NavLink to="../"><button className="defaultColor button">Back</button></NavLink>
          </div>
      </div>
      </React.Fragment>
    )
  }
  else  {
    return(
      <DashboardTeacher stateToPass = {[this.state.token,this.state.username]} clearToken = {this.clearToken}/>
      )
  }
}
}
