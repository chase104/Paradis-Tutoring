<script>
  import About from "./components/About.svelte";
  import Contact from "./components/Contact.svelte";
  import Footer from "./components/Footer.svelte";
import Header from "./components/Header.svelte";
  import ReviewForm from "./components/ReviewForm.svelte";
  import Reviews from "./components/Reviews.svelte";
  import Services from "./components/Services.svelte";
  import { setContext } from 'svelte';

    let services = [
        { type: "English", description: "Offering personalized English language tutoring tailored to every learning stage—from beginners eager to lay a strong foundation, to advanced learners looking to refine their fluency. Courses are designed to suit needs in mastering Business English or improving conversational skills.", types: ["Beginner Classes", "Intermediate Classes", "Advanced Classes", "Business English", "Conversation Classes"] },
        { type: "SAT Prep", description: "Provides comprehensive preparation covering all sections of the SAT: Reading, Writing, and Math. The approach combines strategic review with practical test-taking strategies, ensuring full preparation on exam day.", types: ["Reading", "Writing", "Math"] },
        { type: "Advanced Tutoring", description: "Advanced tutoring in Literary Analysis, Professional Writing, and Public Speaking. Whether dissecting complex texts, crafting written communications, or delivering speeches, guidance is designed to elevate skills and confidence.", types: ["Literary Analysis", "Professional Writing", "Public Speaking"] },
    ];

    let clickedTopic = "ART";
    let updateClickedTopic = (topic) => {
        clickedTopic = topic;
    }
    setContext('clickedTopic', { clickedTopic, updateClickedTopic });
    setContext('services', services);

  </script>

  <main>
    <Header />
    <Services />
    <About />
    <Contact />
    <Reviews />
    <Footer />
  </main>
  
  <style>

    body {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  </style>