// DEV ONLY. Messages the chat simulator sends as the runner. Plainly labelled
// as test messages (no invented conversation), numbered so it's easy to see
// order and unread counts. Never reachable in a release build.
export function nextDevRunnerReply(alreadySent: number): string {
  return `Test message ${alreadySent + 1} from the runner`;
}
