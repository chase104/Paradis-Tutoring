<script>
    import { onMount } from 'svelte';
    import { cubicOut } from 'svelte/easing';  // Importing the easing function
    import { slide, fly } from 'svelte/transition';
  import NextButton from './NextButton.svelte';

    let isVisible = false;
  
    onMount(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting && !isVisible) {

                isVisible = true;
            }
        },
        {
          threshold: 0.5  // Trigger when 50% of the element is in view
        }
      );
  
      observer.observe(document.querySelector('.about-me'));
  
      return () => {
        observer.disconnect();
      };
    });



  </script>
  
  <style>
    .about-me {
        background: linear-gradient(
      to bottom right,
      rgba(244, 244, 242, 0.9),
      rgba(244, 244, 242, 0.9)
    ),
    url("../assets/scholastic_dark.png") ;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 105vh;
      color: #333;
      padding: 20px;
      box-sizing: border-box;
      position: relative;
      overflow: hidden; 
    }
  
    .profile-image {
      width: 200px;
      height: 200px;
      margin-left: 150vw;
      border-radius: 50%;
      margin-bottom: 20px;
      transition-duration: 1s;
    }
  
    .visible {
        margin-left: 0vw;
    }
    h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 300;
    }
  
    p {
      font-size: 1.2rem;
      margin-left: auto;
    margin-right: auto;
      text-align: center;
      max-width: 600px;
      margin-top: 20px;
    }
    .black-text {
        color: black !important;
        padding-top: 0px;
    }
    .carousel-container {
    display: flex;
    justify-content: center;
    min-height: 200px;
    width: 50vw;
  }
  .carousel-content {
    display: flex; 
    min-width: 100%; 
    justify-content: center;
    position: relative;
  }
  .carousel-content > div {
    position: absolute;
    width: 100%; 
  }
  button {
    border: none;
    background: none;
    font-size: 24px;
    cursor: pointer;
  }
  </style>
  
  <div class="about-me" id="#about">
    <img 
      src="../assets/paradis_profile.jpg" 
      alt="Your Name"
      class="profile-image"
      use:fly={{ y: 200, duration: 800, delay: 0, opacity: 0, easing: cubicOut }} Applied cubicOut easing
      class:visible={isVisible}
    >
    <h1 class="section-title black-text">About Me</h1>
    <p>
        Hello! I'm Mr. Paradis, an experienced educator with a rich background in teaching English across various levels and a passion for helping students achieve their academic goals. Originally from the USA, I've embraced the adventure of living abroad, bringing a global perspective to my teaching methods.
    </p>
    <NextButton target="#contact" theme="dark" />
  </div>
  
  
