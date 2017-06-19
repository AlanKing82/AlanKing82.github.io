import React, { Component } from 'react';
import $ from 'jquery';
import './App.css';
import Header from './Components/Header';
import About from './Components/About';
import Resume from './Components/Resume';
import Portfolio from './Components/Portfolio';
import Testimonials from './Components/Testimonials';
import Contact from './Components/Contact';
import Footer from './Components/Footer';

class App extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      portfolioData: {}
    }
  }

  getPortfolioData(){
    $.ajax({
      url: 'http://localhost:3000/portfolioData.json',
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({portfolioData: data});
      }.bind(this),
      error: function(xhr, status, err){
        console.log(err);
        alert(err);
      }
    });
  }

  componentDidMount(){
    this.getPortfolioData();
  }

  render() {
  
    return (
      <div className="App">
        <Header data={this.state.portfolioData.main} />
        <About data={this.state.portfolioData.main} />
        <Resume data={this.state.portfolioData.resume} />
        <Portfolio />
        <Testimonials />
        <Contact />
        <Footer />
      </div>
    );
  }
}

export default App;
