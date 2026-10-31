// Runs on a time trigger. Sends matching unread emails to Supabase.
// Script properties: SUPABASE_URL, SUPABASE_TRIGGERS (comma separated, empty = all)
function checkUnreadEmails() {
  const props = PropertiesService.getScriptProperties();
  const url = props.getProperty("SUPABASE_URL");
  if (!url) return Logger.log("Missing SUPABASE_URL");
  const triggers = (props.getProperty("SUPABASE_TRIGGERS") || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const owner = Session.getEffectiveUser().getEmail();

  for (const thread of GmailApp.search("is:unread newer_than:1d")) {
    for (const msg of thread.getMessages()) {
      const subject = msg.getSubject();
      const lower = subject.toLowerCase();
      if (triggers.length && !triggers.some((t) => lower.includes(t))) continue;

      const response = UrlFetchApp.fetch(url, {
        method: "post",
        contentType: "application/json",
        muteHttpExceptions: true,
        payload: JSON.stringify({
          id: msg.getId(),
          owner,
          subject,
          from: msg.getFrom(),
          date: msg.getDate(),
          body: msg.getPlainBody().slice(0, 4000),
        }),
      });
      Logger.log(response.getResponseCode() + " " + subject);
      if (response.getResponseCode() === 200) msg.markRead();
    }
  }
}
