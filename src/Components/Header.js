import React, { Component } from 'react';
import Slider from './Slider';

class Header extends Component {
  
    constructor () {
    super();
    this.state = {
      images: [
        'https://s3-us-west-2.amazonaws.com/s.cdpn.io/186499/slide-1.jpg',
        'https://s3-us-west-2.amazonaws.com/s.cdpn.io/186499/slide-2.jpg',
        'https://s3-us-west-2.amazonaws.com/s.cdpn.io/186499/slide-3.jpg',
        'https://s3-us-west-2.amazonaws.com/s.cdpn.io/186499/slide-4.jpg',
        'https://s3-us-west-2.amazonaws.com/s.cdpn.io/186499/slide-5.jpg',
      ]
    }
    this.state.images.forEach(image => {
      const preload = new Image();
      preload.src = image;
    })
  }
  
  
  
  
  
  
  
  render() {
    if(this.props.data){
      var name = this.props.data.name,
          occupation = this.props.data.occupation,
          description = this.props.data.description,
          city = this.props.data.address.city;
       
       var networks = this.props.data.social.map(function(network){
         return <li key={network.name}><a href={network.url}><i className={network.className}></i></a></li>
       });

    }

    const { images } = this.state;
    const slides = images.map(image => {
      return {
        content: <img src={image}/>,
        preview: <img src={image}/>
      }
    });

    return (
      <div>
    <Slider
      slides={slides}
      animSettings={{animDuration: 500, animElasticity: 200}}
      dotSettings={{size: 12, gap: 6}} /> 

   <header id="home">


      <nav id="nav-wrap">

         <a className="mobile-btn" href="#nav-wrap" title="Show navigation">Show navigation</a>
	      <a className="mobile-btn" href="#" title="Hide navigation">Hide navigation</a>

         <ul id="nav" className="nav">
            <li className="current"><a className="smoothscroll" href="#home">Home</a></li>
            <li><a className="smoothscroll" href="#about">About</a></li>
	         <li><a className="smoothscroll" href="#resume">Resume</a></li>
            <li><a className="smoothscroll" href="#portfolio">Works</a></li>
            <li><a className="smoothscroll" href="#testimonials">Testimonials</a></li>
            <li><a className="smoothscroll" href="#contact">Contact</a></li>
         </ul>

      </nav>
    


{/*
      <div className="row banner">
         <div className="banner-text">
            <h1 className="responsive-headline">Im {name}.</h1>
            <h3>Im a {city} based <span>{occupation}.</span> {description}</h3>
            <hr />
            <ul className="social">
              {networks}
            </ul>
         </div>
      </div>
  */}

      <p className="scrolldown">
         <a className="smoothscroll" href="#about"><i className="icon-down-circle"></i></a>
      </p>

   </header>
   </div>
    );
  }
}

export default Header;