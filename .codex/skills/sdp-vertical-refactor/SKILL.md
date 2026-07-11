# SDP Vertical Refactor

Use this skill for behavior-preserving architectural refactors.

1. Establish a verified baseline before product-code changes.
2. Refactor one vertical workflow at a time.
3. Preserve a runnable application after every Slice.
4. Move behavior behind explicit contracts before deleting compatibility paths.
5. Keep state ownership singular and action targets explicit.
6. Verify typecheck, tests, build and rendered behavior after each Slice.
7. Use a fresh Reviewer and stop at the Slice boundary.

Never split files merely to reduce line count. Reduce coupling and cognitive load;
delete adapters last.