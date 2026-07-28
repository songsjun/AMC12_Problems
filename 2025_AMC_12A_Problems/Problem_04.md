# 2025 AMC 12A Problem 4

> This problem is the same as [2025 AMC 10A #8](https://artofproblemsolving.com/wiki/index.php/2025_AMC_10A_Problems/Problem_8) and [2025 AMC 12A #4](https://artofproblemsolving.com/wiki/index.php/2025_AMC_12A_Problems/Problem_4).
## Problem
Agnes writes the following four statements on a blank piece of paper.

- At least one of these statements is true.

- At least two of these statements are true.

- At least two of these statements are false.

- At least one of these statements is false.

Each statement is either true or false. How many false statements did Agnes write on the paper?

$\textbf{(A) } 0 \qquad\textbf{(B) } 1 \qquad\textbf{(C) } 2 \qquad\textbf{(D) } 3 \qquad\textbf{(E) } 4$
## Solution 1
Number the statements as follows:

1. At least one of these statements is true.
2. At least two of these statements are true.
3. At least two of these statements are false.
4. At least one of these statements is false.

Statement 4 cannot be false: that would mean that no statement is false, so statement 4 would be true after all. Statement 1 cannot be false either, because then all statements would be false, contradicting the fact that statement 4 is true.

Thus statements 1 and 4 are true, so statement 2 is also true. Consequently statement 3 is false, and there is exactly one false statement. The answer is $\boxed{\textbf{(B) }1}$.
*~Rainjs*
## Solution 2
Statements I,II, and IV are true, while statement III is false. Hence, there are 3 true statements and $\boxed{\text{(B) }1}$ false statement. This result can be checked by examining the statements individually again.

Statements I and II will be true because there are $3\ge2$ true statements. Statement IV is also true because there is $1\ge1$ false statement. Finally, statement III is false because there are 1\ngeq2 false statements.

*~Tacos_are_yummy_1*
## Solution 3
Let's say there are T true statements. We know that T can be any integer from 0 to 4. We denote A as T $\geq 1,$ Statement B as T $\geq 2,$ Statement C as T $\leq 2,$ and Statement D as T $\leq 3.$

If T=0, then C and D are met, so there are 2 true statements, which is a contradiction.

If T=1, then A,C,D are met, so there are 3 true statements, which is a contradiction.

If T=2, then A,B,C,D are met, so there are 4 true statements, which is a contradiction.

If T=3, then A,B,D are met, so there are 3 true statements, which is consistent with our assumption that T=3.

If T=4, then A,B are met, so there are 2 true statements, which is a contradiction.

Only T=3 was consistent, so there are 3 true statements and $4-3=\boxed{1}$ false statement. (In particular, Statement C is the false statement).

*~lprado*
## Solution 4
Suppose Statement I is false, then none of the Statements are true, which contradicts the fact that a false Statement III or IV is telling the truth. Therefore, Statement I is true and assume Statement II is false.

Statement II thus implies that only Statement I was the truth, and the rest, false. But then, there are 3 false statements but then Statement III and Statement IV are telling the truth. So Statement II is also true.

Now, if Statement III is true, then both Statement III and Statement IV is false, contradicting the fact that it is true. Statement III is hence false and Statement IV tells the truth since Statement III lied so indeed, there are at least one lie. There are a total of 3 truths and 1 lie, making the answer $\boxed{\text{(B) }1}.$ ~hxve
## Solution 5 (Quick)
I tried setting that the statements regarding the true ones (I and II) were true and
regarding the false ones (III and IV) were false, and it clearly doesn't work.
It doesn't work because statement III was true, not false as I set it to be originally.

What if we make that statement (Statement III) true too?
Well, then we have 3 T and 1 F statements, so statement IV is false,
statement III is true, and statements I and II are true too.

So there is $\boxed{\text{(B) }1}$ false statement.

*~Aarav22*
## Solution 6 (Plug in Answer Choices)
For this question, what I did was to simply test each of the answer choices.

Let's start with (A) 0 false statements:

We can check the answer of 0 false statements against each of the statements.

Statement I: "At least one of these statements is true."

This statement is false, which already invalidates the answer of (A) 0 false statements, as we already have a false statement.

Let's move onto (B) 1 false statement:

We can check once again this answer against each of the statements.

Statement I: "At least one of these statements is true."

This statement is true, as when we have 1 false statement, we have 3 true statements, and therefore this is true.

Statement II: "At least two of these statements are true."

Once again, this statement is true, as when we have 1 false statement, we have 3 true statements, and thus this is also true.

Statement III: "At least two of these statements are false."

This statement is false, as we have one false statement, not 2 and above.

Statement IV: "At least one of these statements is false."

This statement is true, as we have one false statement.

So, after checking the answer choice of (B) 1 false statement across the 4 statements, we get three true statements and one false statement, making this statement the correct answer. I will not dive into the other 3 answer choices, as we have already gotten the answer for this question, and if you were doing this way of solving on the test, you would most likely not test the other 3 answers either for the sake of saving time.

*~EZ123 (Would appreciate it if someone formatted my solution using latex, thanks!)*
## Solution 7 (Step by Step, Simple)
Start by going statement by statement and checking if they can be false. If statement 1 were false statement 4 would be true leading to a contradiction so statement 1 is true. If statement 2 were false 4 would be true and one would be true making statement 2 true. If statement 3 was false and we know statement 1 and statement 2 were true and 4 can be true and it works. Therefore, the correct answer is $\boxed{\text{(B) }1}.$

--TFEA(would also appreciate if somebody could please latex my proof).
--Iceboy1$221(i wrote it using latex)$
## Video Solution by Power Solve
https://youtu.be/QBn439idcPo?si=DGqtuDIJ399xE_rh&t=524
## Chinese Video Solution
https://www.bilibili.com/video/BV1t72uBREof/

*~metrixgo*
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
## Video Solution (In 1 Min)
https://youtu.be/uv3uIMwIkrg?si=XCbsXL7ikMawCGyM ~ Pi Academy
## Video Solution by Daily Dose of Math
https://youtu.be/gPh9w3X3QSw
*~Thesmartgreekmathdude*
## Video Solution by Thinking Feet
https://youtu.be/LXFX2ggFeQ8
## See Also
