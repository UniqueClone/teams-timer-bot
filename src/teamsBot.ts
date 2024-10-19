import { CardFactory, TeamsActivityHandler, TurnContext } from "botbuilder";

// An empty teams activity handler.
// You can add your customization code here to extend your bot logic if needed.
export class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {
      const text = context.activity.text
        ? context.activity.text.trim().toLowerCase()
        : "";

      if (text === "start timer") {
        const card = {
          type: "AdaptiveCard",
          body: [
            {
              type: "TextBlock",
              text: "Select Timer Length",
              weight: "bolder",
              size: "medium",
            },
            {
              type: "Input.ChoiceSet",
              id: "timerLength",
              style: "compact",
              choices: [
                { title: "1 minute", value: "1" },
                { title: "3 minutes", value: "3" },
                { title: "5 minutes", value: "5" },
                { title: "10 minutes", value: "10" },
              ],
            },
          ],
          actions: [
            {
              type: "Action.Submit",
              title: "Start Timer",
            },
          ],
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.3",
        };
        await context.sendActivity({
          attachments: [CardFactory.adaptiveCard(card)],
        });
      } else if (context.activity.value && context.activity.value.timerLength) {
        const timerLength = parseInt(context.activity.value.timerLength, 10);
        await context.sendActivity(
          `Timer started for ${timerLength} minute(s).`
        );

        const conversationReference = TurnContext.getConversationReference(
          context.activity
        );

        // Use a separate function to handle the timer
        this.startTimer(context.adapter, conversationReference, timerLength);
      }
      await next();
    });
  }

  startTimer(adapter, conversationReference, timerLength) {
    setTimeout(async () => {
      await adapter.continueConversationAsync(
        conversationReference,
        async (proactiveContext) => {
          await proactiveContext.sendActivity("Time is up!");
        }
      );
    }, timerLength * 60000); // Convert minutes to milliseconds
  }
}
