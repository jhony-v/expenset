function checkUnreadEmails() {
  const threads = GmailApp.search("is:unread newer_than:1d");
  Logger.log("Threads found: " + threads.length);
  const scriptProperties = PropertiesService.getScriptProperties();
  const supabaseUrl = scriptProperties.getProperty("SUPABASE_URL");
  const supabaseTriggers = scriptProperties.getProperty("SUPABASE_TRIGGERS") || "";
  // Empty SUPABASE_TRIGGERS = send every unread email (useful for testing)
  const conditions = supabaseTriggers.split(",").map((c) => c.trim()).filter(Boolean);
  Logger.log("Triggers: " + (conditions.length ? conditions.join(", ") : "(none, sending all)"));

  for (const thread of threads) {
    const messages = thread.getMessages();
    for (const msg of messages) {
      const payload = {
        subject: msg.getSubject(),
        from: msg.getFrom(),
        date: msg.getDate(),
        body: msg.getPlainBody().slice(0, 1005),
      };
      const subject = payload.subject.toLowerCase();
      const canRun =
        conditions.length === 0 || conditions.some((c) => subject.includes(c));
      if (canRun) {
        Logger.log("Sending: " + payload.subject + " | from: " + payload.from);
        const response = UrlFetchApp.fetch(supabaseUrl, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload),
          muteHttpExceptions: true,
        });
        Logger.log("Status: " + response.getResponseCode());
        Logger.log("Response: " + response.getContentText());
      } else {
        Logger.log("Skipped: " + payload.subject);
      }
    }
    thread.markRead();
  }
  Logger.log("Done");
}

// Read-only: logs unread emails that match the triggers.
// Does not call Supabase and does not mark anything as read.
function previewInbox() {
  const threads = GmailApp.search("is:unread newer_than:1d");
  Logger.log("Threads found: " + threads.length);
  const supabaseTriggers =
    PropertiesService.getScriptProperties().getProperty("SUPABASE_TRIGGERS") ||
    "";
  const conditions = supabaseTriggers.split(",").map((c) => c.trim()).filter(Boolean);
  Logger.log("Triggers: " + (conditions.length ? conditions.join(", ") : "(none, all match)"));

  for (const thread of threads) {
    for (const msg of thread.getMessages()) {
      const subject = msg.getSubject();
      const match =
        conditions.length === 0 || conditions.some((c) => subject.toLowerCase().includes(c));
      Logger.log((match ? "MATCH " : "skip  ") + subject + " | " + msg.getFrom());
      if (match) {
        Logger.log(msg.getPlainBody().slice(0, 500));
      }
    }
  }
}
