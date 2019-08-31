{
    id: "some_id",                  // Unique event ID
    name: "Some Event",             // Displayable Event Name
    subheading: "A Sample Event"    // Event Subheading
    category: "debate",             // Event Category Key
    category_name: "Debating",      // Displayable Category Name
    type: "Competitive",            // Event type (mostly unnecessary)
    description: "..long string",   // Event Description
    rules: "..long string",         // Event Rules
    prizes: "..long string",        // Event Prizes
    dtv: [{                         // List of event schedule
            type: "Prelims",                // Append after "name" if present
            date: "Day 1 (16/10)",          // Date of this event chunk
            start_time: "<Date() string>",  // Start Time (usable as 'new Date(start_time)')
            end_time: "<Date() string>",    // End Time (usable as 'new Date(end_time)')
            venue: "LH510",                 // Venue of this event chunk
        },...],
    poc: [{...}],                   // List of team members' data who are Points of Contact
    photos: [...],                  // List of 4 public S3 links for event images
    registration: true,             // Boolean: Event does not need registration if false
    reg_status: true,               // Boolean: If false, not taking registrations anymore
    reg_deadline: "<Date() string>" // Deadline for display purposes only (usable as 'new Date(reg_deadline)')
    reg_type: "Team",               // String Enum: Single / Team
    reg_mode: "Website",            // String Enum: Website / Email / External (no reg if != Website)
    reg_link_upload: false          // Boolean: Submission link text field reqd. if true
    reg_email: "debate@gmail.com",  // (if reg_mode == "Email") Mail ID for reg
    reg_link: "form.google.com/xd", // (if reg_mode == "External") External Link for reg
    reg_min_team_size: 2            // (if reg_type == "Team") Min reqd. team size (verified at backend)
    reg_max_team_size: 10           // (if reg_type == "Team") Max reqd. team size (verified at backend)
    reg_count: 231                  // # of reg till now (not available on open API)
    registrations: [...]            // List of reg till now (not available on open API)
}
