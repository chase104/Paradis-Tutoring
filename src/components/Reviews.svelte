<script>
     import { onMount } from 'svelte';

    let reviews = [
        {
        title: "Simply the Best!",
        stars: 5,
        description: "I've had several tutors over the years, but none have matched the clarity and dedication I found here. Every session is thoughtfully tailored to my needs. Absolutely top-notch service that has far exceeded my expectations!"
    },
    {
        title: "Very Satisfied",
        stars: 4,
        description: "The sessions are well-structured and efficient, though I wish we had more conversation practice."
    },
    {
        title: "Good, but has room for improvement",
        stars: 3,
        description: "The tutoring service is quite beneficial, but sometimes the pace is a bit fast, and the homework can be overwhelming. I would appreciate more interactive exercises and timely feedback."
    },
    {
        title: "Exceptional Quality",
        stars: 5,
        description: "As a non-native speaker, this course has been a revelation. Not only has my English improved, but my confidence in professional settings has skyrocketed."
    },
    {
        title: "Decent Experience",
        stars: 3,
        description: "The tutor is knowledgeable, yet the classes can feel rushed. Slowing down would help ensure everyone fully understands the material."
    },

    {
        title: "Fantastic SAT Prep",
        stars: 5,
        description: "After these prep classes, my SAT scores improved dramatically. The tutor was supportive, and the strategies provided for the math section were invaluable."
    },
    {
        title: "Solid Tutoring",
        stars: 4,
        description: "Good tutoring overall. I appreciate the flexible scheduling and personalized attention, especially with my writing. It's been a great help for my college applications."
    },

    {
        title: "Perfect for Public Speaking",
        stars: 5,
        description: "I used to dread public speaking, but thanks to this course, I've made significant improvements. The personal coaching and detailed feedback have been particularly beneficial. I feel much more poised and ready to tackle any speaking event."
    }
];

  
    let currentIndex = 0;
    let visibleReviews = 3;
    function updateVisibleReviews() {
        console.log(window.innerWidth);
    if (window.innerWidth < 768) {
      visibleReviews = 1;
    } else {
      visibleReviews = 3;
    }
  }
console.log(visibleReviews);
  onMount(() => {
    updateVisibleReviews();
    window.addEventListener('resize', updateVisibleReviews);
    return () => {
      window.removeEventListener('resize', updateVisibleReviews);
    };
  });
    function handleNav(direction) {
      if (direction === 'next') {
        currentIndex = (currentIndex + visibleReviews) % reviews.length;
      } else {
        currentIndex = ((currentIndex - visibleReviews + reviews.length) % reviews.length);
      }
    }
  </script>
  
  <div class="carousel-container">
    <button on:click={() => handleNav('prev')}>◀</button>
    <div class="review-carousel">
      {#each reviews.slice(currentIndex, currentIndex + visibleReviews) as review (review.title)}
        <div class="review-item" class:all-space={visibleReviews === 1}>
          <h3>{review.title}</h3>
          <div class="stars">
            {#each Array(5) as _, i}
              <span class="star">{i < review.stars ? '★' : '☆'}</span>
            {/each}
          </div>
          <p>{review.description}</p>
        </div>
      {/each}
    </div>
    <button on:click={() => handleNav('next')}>▶</button>
  </div>
  
  <style>
    .carousel-container {
      display: flex;
      width: 70vw;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      margin-left: auto;
    margin-right: auto;

    }
    .carousel-container button {
      z-index: 10;
    }
    .review-carousel {
      display: flex;
      transition: transform 0.5s ease;
      will-change: transform;
    }
    .review-item {
      flex: 0 0 30%;

        margin: 0px 10px;
    max-width: 100%;
      box-sizing: border-box;
      padding: 20px;
      text-align: center;
    }
    .one-third {
    }
    .all-space {
      flex: 0 0 100% !important;
    }
    .stars {
      color: #ffc107; /* Gold color */
      font-size: 24px; /* Larger star size */
    }
    .star {
      padding: 0 2px; /* Add spacing between stars */
    }
    button {
      border: none;
      background: none;
      font-size: 24px;
      cursor: pointer;
    }
  </style>
  