export const SAMPLE_TRANSCRIPT = `Meeting: Q3 Product Planning Sync
Date: ${new Date().toLocaleDateString()}

Attendees: Sarah Chen (PM), Mike Rodriguez (Eng Lead), Aisha Patel (Design Lead), Tom Nguyen (QA), Jessica Williams (Marketing)

Sarah: Alright everyone, let's get started. We need to finalize the Q3 roadmap and make sure we're aligned on the next sprint. Mike, where are we on the search performance refactor?

Mike: We've made good progress. The team has indexed about 80% of the legacy content. I'll have the remaining indexing done by Friday. After that, we need to run load tests — Tom, can you handle that?

Tom: Yeah, I can start load testing on Monday. I should have results by next Tuesday.

Sarah: Great. Aisha, the new search UI — where does that stand?

Aisha: The high-fidelity mocks are ready. I shared them with Sarah yesterday. I need final sign-off from Sarah by Wednesday, then I'll hand off to engineering. Mike, once you get the mocks, can your team start implementation?

Mike: Yes, we can start as soon as we get sign-off. I'll assign two engineers to the search UI. We should have a working prototype by end of month.

Sarah: Sounds good. One key decision: we're going with Elasticsearch for the new search backend. Everyone agree?

Mike: Agreed. It's the right call for scalability.

Aisha: Works for me. I'll update the design docs to reflect the Elasticsearch decision.

Sarah: Next topic — the mobile app. Jessica, marketing needs the app ready for the fall campaign. When does that launch?

Jessica: The fall campaign kicks off October 15th. We really need the mobile app in the app stores by October 10th at the latest. Can engineering commit to that?

Mike: That's tight but doable. I'll put together a timeline for the mobile app by this Friday and share it with everyone. Tom, we'll need QA resources for mobile testing the week before launch.

Tom: I'll block out the first week of October for mobile QA. I'll have a full test plan written by September 25th.

Sarah: Good. Jessica, what about the marketing materials?

Jessica: I need the final app screenshots and copy from design by October 1st. Aisha, can you deliver those?

Aisha: Yes, I'll have the screenshots and copy ready by October 1st. But I need to know the final feature list — Mike, can you confirm what's shipping in the mobile app by Friday?

Mike: I'll confirm the feature list by Friday. No problem.

Sarah: One open question — are we supporting offline mode in the first mobile release? We haven't decided that yet.

Mike: I think we should defer offline mode to Q4. It adds significant complexity.

Tom: I agree, offline mode should wait. Testing that properly would push our timeline.

Sarah: Okay, let's make that a decision: offline mode is deferred to Q4. Mike, please document that.

Mike: Will do. I'll update the roadmap doc by Wednesday.

Sarah: Last item — the analytics dashboard. We said we'd review it last sprint but ran out of time. Aisha, did you get a chance to look at the data visualization mocks?

Aisha: I did. I have some feedback. I think the current charts are too cluttered. I'll send revised mockups to the team by next Tuesday. We should review them together in the next design review.

Sarah: Perfect. Let's also make sure we're tracking the right metrics. Jessica, can you put together a list of the top 10 metrics marketing cares about?

Jessica: Sure, I'll have that list by Thursday this week.

Sarah: Great. So to summarize: Mike has the search indexing done by Friday, the mobile timeline by Friday, and the feature list confirmed by Friday. Tom handles load testing by next Tuesday and the mobile test plan by September 25th. Aisha delivers search UI sign-off by Wednesday, app screenshots by October 1st, and revised analytics mocks by next Tuesday. Jessica delivers the metrics list by Thursday. Any questions?

Mike: No, all clear.

Aisha: Got it.

Tom: Sounds good.

Jessica: All set.

Sarah: Thanks everyone. Let's regroup next week to check progress.`;
