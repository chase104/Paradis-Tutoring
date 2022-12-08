<script>
    import { onMount } from 'svelte';
    import { cubicOut } from 'svelte/easing';  // Importing the easing function
    import { slide, fly } from 'svelte/transition';

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

    let currentIndex = 0;
  const sections = [
    {
      title: "English Language Tutoring",
      content: "Offering personalized English language tutoring tailored to every learning stage—from beginners eager to lay a strong foundation, to advanced learners looking to refine their fluency. Courses are designed to suit needs in mastering Business English or improving conversational skills."
    },
    {
      title: "SAT Preparation",
      content: "Provides comprehensive preparation covering all sections of the SAT: Reading, Writing, and Math. The approach combines strategic review with practical test-taking strategies, ensuring full preparation on exam day."
    },
    {
      title: "Advanced Tutoring Services",
      content: "Advanced tutoring in Literary Analysis, Professional Writing, and Public Speaking. Whether dissecting complex texts, crafting written communications, or delivering speeches, guidance is designed to elevate skills and confidence."
    }
  ];

  function handleNav(direction) {
    if (direction === 'next') {
      currentIndex = (currentIndex + 1) % sections.length;
    } else {
      currentIndex = (currentIndex - 1 + sections.length) % sections.length;
    }
  }
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
      min-height: 100vh;
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
  
  <div class="about-me">
    <img 
      src="../assets/paradis_profile.jpg" 
      alt="Your Name"
      class="profile-image"
      use:fly={{ y: 200, duration: 800, delay: 0, opacity: 0, easing: cubicOut }} Applied cubicOut easing
      class:visible={isVisible}
    >
    <h1 class="section-title black-text">About Me</h1>
    <p>
        Hello! I'm Matt Paradis, an experienced educator with a rich background in teaching English across various levels and a passion for helping students achieve their academic goals. Originally from the USA, I've embraced the adventure of living abroad, bringing a global perspective to my teaching methods.

    </p>
    <div class="carousel-container">
        <button on:click={() => handleNav('prev')}>◀</button>
        <div class="carousel-content">
          {#each sections as section, index}
            {#if index === currentIndex}
              <div transition:fly={{ y: 0, duration: 300 }}>
                <h2>{section.title}</h2>
                <p>{section.content}</p>
              </div>
            {/if}
          {/each}
        </div>
        <button on:click={() => handleNav('next')}>▶</button>
      </div>
  </div>
  
  
  <!--       src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Dprofile&psig=AOvVaw0PvRYD2wB6GAPhqOYQZC0c&ust=1713540849627000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJCl4Z6LzIUDFQAAAAAdAAAAABAE"  -->