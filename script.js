
    // Theme Toggle (Desktop + Mobile)
    const desktopToggle = document.getElementById('themeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');

    function toggleTheme() {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      
      const icon = isDark ? "<i class='bx bx-sun'></i>" : "<i class='bx bx-moon'></i>";
      if (desktopToggle) desktopToggle.innerHTML = icon;
      if (mobileThemeToggle) mobileThemeToggle.innerHTML = icon;
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      const icon = "<i class='bx bx-sun'></i>";
      if (desktopToggle) desktopToggle.innerHTML = icon;
      if (mobileThemeToggle) mobileThemeToggle.innerHTML = icon;
    }

    if (desktopToggle) desktopToggle.onclick = toggleTheme;
    if (mobileThemeToggle) mobileThemeToggle.onclick = toggleTheme;

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    mobileMenuBtn.onclick = () => {
      mobileMenuBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    };

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        mobileMenuBtn.click();
      }
    });

    mobileLinks.forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
              target.scrollIntoView({behavior: 'smooth', block: 'start'});
            }, 400);
          }
        }
      };
    });

    // Smooth scroll for CTA
    document.querySelectorAll('.cta').forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({behavior: 'smooth', block: 'start'});
          }
        }
      };
    });

    // Sidebar navigation
    const navDots = document.querySelectorAll('.nav-dot');
    navDots.forEach(dot => {
      dot.onclick = () => {
        const section = document.getElementById(dot.dataset.section);
        if (section) {
          section.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
      };
    });

    // Update active nav dot on scroll
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navDots.forEach(dot => dot.classList.remove('active'));
          const activeDot = document.querySelector(`.nav-dot[data-section="${entry.target.id}"]`);
          if (activeDot) {
            activeDot.classList.add('active');
          }
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Scroll animations
    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animateOnScroll.unobserve(entry.target); // Stop observing after animation
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });

    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
      animateOnScroll.observe(el);
    });

    window.addEventListener('load', () => {
      document.querySelectorAll('#hero .fade-in').forEach(el => {
        el.classList.add('visible');
      });
    });

    // Chatbot
    const chatToggle = document.getElementById('chatToggle');
    const chatbot = document.getElementById('chatbot');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');

    let apiKey = localStorage.getItem('gemini_api_key') || '';
    let conversationHistory = [];

    const portfolioContext = `You are a helpful assistant for Albert's portfolio website. Albert is a Junior Software Developer specializing in enterprise web systems.

Key Information:
- Current Role (2024-Present): Junior Software Developer working on Approval Systems, ePMS (KRA-based performance evaluation), and Sales Management tools
- Experience (2023): Built ASP.NET Core MVC systems with authentication, dashboards, Excel import/export, and role-based access
- Focus: Backend logic, SQL Server performance, and maintainable real-world systems

Core Projects:
1. Approval System: Multi-level approval workflows with audit trails and role-based access
2. ePMS/KRA: Employee performance evaluation system with scoring logic
3. Sales Management: Daily sales tracking, dashboards, and reporting tools

Technical Stack:
- ASP.NET Core MVC
- SQL Server
- Repository Pattern
- Dashboards & Reports
- Excel Import/Export
- Authentication & Authorization

Answer questions about Albert's experience, skills, and projects in a helpful and professional manner. Keep responses concise and relevant.`;

    chatToggle.onclick = () => {
      chatbot.classList.toggle('active');
      if (chatbot.classList.contains('active')) {
        chatInput.focus();
      }
    };

    async function sendMessage() {
      const message = chatInput.value.trim();
      if (!message) return;

      if (!apiKey) {
        const key = prompt('Please enter your Gemini API key (get it free at https://aistudio.google.com/apikey):');
        if (!key) return;
        apiKey = key;
        localStorage.setItem('gemini_api_key', key);
        document.getElementById('apiNotice').style.display = 'none';
      }

      addMessage(message, 'user');
      chatInput.value = '';
      sendBtn.disabled = true;
      sendBtn.classList.add('loading');
      typingIndicator.classList.add('active');

      try {
        conversationHistory.push({
          role: 'user',
          parts: [{text: message}]
        });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{text: portfolioContext}]
              },
              ...conversationHistory
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500
            }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'API error');
        }

        const botReply = data.candidates[0].content.parts[0].text;
        conversationHistory.push({
          role: 'model',
          parts: [{text: botReply}]
        });

        addMessage(botReply, 'bot');
      } catch (err) {
        console.error('Chat error:', err);
        addMessage('Sorry, I encountered an error. Please check your API key and try again.', 'bot');
        apiKey = '';
        localStorage.removeItem('gemini_api_key');
        document.getElementById('apiNotice').style.display = 'block';
      } finally {
        typingIndicator.classList.remove('active');
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
        chatInput.focus();
      }
    }

    function addMessage(text, type) {
      const msg = document.createElement('div');
      msg.className = `message ${type}`;
      msg.textContent = text;
      chatMessages.appendChild(msg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendBtn.onclick = sendMessage;
    chatInput.onkeypress = (e) => {
      if (e.key === 'Enter' && !sendBtn.disabled) sendMessage();
    };

    // Hide API notice if key exists
    if (apiKey) {
      document.getElementById('apiNotice').style.display = 'none';
    }