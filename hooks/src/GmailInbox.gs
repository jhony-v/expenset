function checkUnreadEmails() {
  const threads = GmailApp.search("is:unread newer_than:1d");
  Logger.log("Threads found: " + threads.length);
  const scriptProperties = PropertiesService.getScriptProperties();
  const supabaseUrl = scriptProperties.getProperty("SUPABASE_URL");
  const supabaseTriggers = scriptProperties.getProperty("SUPABASE_TRIGGERS");
  Logger.log("Triggers: " + supabaseTriggers);

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
      const conditions = supabaseTriggers.split(",");
      const canRun =
        subject.includes(conditions[0]) ||
        subject.includes(conditions[1]) ||
        subject.includes(conditions[2]);
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
  const conditions = supabaseTriggers.split(",").filter(Boolean);
  Logger.log("Triggers: " + conditions.join(", "));

  for (const thread of threads) {
    for (const msg of thread.getMessages()) {
      const subject = msg.getSubject();
      const match = conditions.some((c) => subject.toLowerCase().includes(c));
      Logger.log((match ? "MATCH " : "skip  ") + subject + " | " + msg.getFrom());
      if (match) {
        Logger.log(msg.getPlainBody().slice(0, 500));
      }
    }
  }
}
