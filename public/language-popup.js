function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: 'en,hi,bn,te,mr,ta,gu,kn,ml,or,pa,as,ur',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    },
    'google_translate_element'
  );
  
  const popup = document.getElementById("language-popup");
  const closeBtn = document.getElementById('close-popup');
  let isExpanded = false;
  
  // Toggle popup on click
  popup.addEventListener('click', (e) => {
    if (e.target === closeBtn) return;
    isExpanded = !isExpanded;
    popup.classList.toggle('expanded', isExpanded);
  });
  
  // Close button functionality
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popup.classList.add('fade-out');
  });
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (popup && !isExpanded) {
      popup.classList.add('fade-out');
    }
  }, 10000);
  
  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && isExpanded) {
      isExpanded = false;
      popup.classList.remove('expanded');
    }
  });
}