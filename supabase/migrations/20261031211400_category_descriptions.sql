-- Descriptions help Gemini pick a category for bank emails and are shown in the review modal.
-- Edit freely; only rows whose name matches are updated.

update category set description = case name
  when 'love' then 'Partner: dates, gifts, dinners or outings together'
  when 'me' then 'Personal spending: clothes, haircut, gym, health, pharmacy, personal care'
  when 'study' then 'Education: courses, books, university, certifications, learning subscriptions'
  when 'entertainment' then 'Fun: streaming, games, cinema, concerts, bars, apps like Netflix or Spotify'
  when 'home' then 'Household: rent, utilities, internet, phone, groceries and supermarket (Wong, Plaza Vea, Tottus)'
  when 'trip' then 'Travel: flights, hotels, Airbnb, bus tickets, tourism'
  when 'job' then 'Work: salary and income, tools, software, coworking, work equipment'
  when 'mom' then 'Family: money or purchases for mom and family'
  when 'other' then 'Anything that does not clearly fit another category, including taxis, Uber and fees'
  else description
end;
