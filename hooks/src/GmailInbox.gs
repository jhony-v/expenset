function checkUnreadEmails() {
  const threads = GmailApp.search("is:unread newer_than:1d");
  Logger.log("Threads found: " + threads.length);
  const scriptProperties = PropertiesService.getScriptProperties();
  const supabaseUrl = scriptProperties.getProperty("SUPABASE_URL");
  const supabaseTriggers = scriptProperties.getProperty("SUPABASE_TRIGGERS");

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
        console.log(payload.subject);
        const response = UrlFetchApp.fetch(supabaseUrl, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload),
        });
        console.log(JSON.stringify(response.getContentText()));
      }
    }
    thread.markRead();
  }
}
