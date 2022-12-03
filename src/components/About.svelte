<script>
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';  // Importing the easing function
  
    let isVisible = false;
  
    onMount(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
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
      min-height: 100vh;
      color: #333;
      padding: 20px;
      box-sizing: border-box;
      position: relative;
      overflow: hidden; /* Ensures nothing shows outside the bounds */
    }
  
    .profile-image {
      width: 250px;
      height: 250px;
      border-radius: 50%; /* Makes the image round */
      margin-bottom: 20px;
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
  </style>
  
  <div class="about-me">
    <img 
      src="" 
      alt="Your Name"
      class="profile-image"
      use:fly={{ y: 200, duration: 800, delay: 0, opacity: 0, easing: cubicOut }} Applied cubicOut easing
      class:visible={isVisible}
    >
    <h1>About Me</h1>
    <p>
Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque ducimus dolore praesentium dolores aliquam illo aspernatur beatae veniam distinctio dolorem quibusdam temporibus, nulla aliquid odio reiciendis cupiditate doloremque nobis consequatur.
    </p>
  </div>
  
  
  <!--       src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Dprofile&psig=AOvVaw0PvRYD2wB6GAPhqOYQZC0c&ust=1713540849627000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJCl4Z6LzIUDFQAAAAAdAAAAABAE"  -->