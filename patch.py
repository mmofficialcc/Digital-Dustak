files = ['about.html', 'contact.html', 'portfolio.html', 'process.html', 'services.html']
widget = '''  <!-- AI Celestial Agent Widget -->
  <div id="celestial-chat-container">
    <div id="chat-window">
      <div class="chat-header">
        <img src="assets/ai-assistant.png" class="header-avatar" alt="Digital Dustak Agent">
        <div class="header-info">
          <h4>Digital Dustak Agent</h4>
          <span>Online</span>
        </div>
      </div>
      <div class="chat-body" id="chat-messages">
        <div class="message bot-message">
          Hi! I'm your Digital Dustak Assistant. How can I scale your brand today?
        </div>
      </div>
      <div class="chat-footer">
        <input type="text" id="chat-input" placeholder="Type a message...">
        <button id="send-msg-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
    <div id="chat-launcher">
      <div class="chat-speech-bubble" id="chat-speech-bubble">
        Hi! I'm your Digital Dustak Agent.<br>How can I help you?
      </div>
      <img src="assets/ai-assistant.png" alt="AI Robot Assistant">
    </div>
  </div>

  <script src="scripts/main.js"></script>'''
for f in files:
  with open(f, 'r', encoding='utf-8') as file: content = file.read()
  if 'id="celestial-chat-container"' not in content:
    content = content.replace('  <script src="scripts/main.js"></script>', widget)
    with open(f, 'w', encoding='utf-8') as file: file.write(content)
