<script>
  import Contact from "./components/Contact.svelte";
import Header from "./components/Header.svelte";
  import Services from "./components/Services.svelte";
  import { setContext } from 'svelte';

    let services = [
        { type: "English", types: ["Beginner Classes", "Intermediate Classes", "Advanced Classes", "Business English", "Conversation Classes"] },
        { type: "Exam Preparation", types: ["IELTS", "TOEFL", "TOEIC", "Cambridge English Exams", "SAT"] },
        { type: "Academic Tutoring", types: ["Mathematics", "Science", "History", "Geography", "Literature", "Writing", "Research", "Study Skills"] },
    ];

    setContext('services', services);
  </script>
  
  <main>
    <Header />
    <Services />
    <Contact />
  </main>
  
  <style>
    main {

    }
    body {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  </style>