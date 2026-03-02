# 2011 AMC 12A Problem 14

## Problem
Suppose a and b are single-digit positive integers chosen independently and at random. What is the probability that the point (a,b) lies above the parabola $y=ax^2-bx$?

$\textbf{(A)}\ \frac{11}{81} \qquad \textbf{(B)}\ \frac{13}{81} \qquad \textbf{(C)}\ \frac{5}{27} \qquad \textbf{(D)}\ \frac{17}{81} \qquad \textbf{(E)}\ \frac{19}{81}$
## Solution
If (a,b) lies above the parabola, then b must be greater than y(a). We thus get the inequality b>a^3-ba. Solving this for b gives us b>$\frac{a^3}{a+1}.$ Now note that $\frac{a^3}{a+1}$ constantly increases when a is positive. Then since this expression is greater than 9 when $a=4$, we can deduce that a must be less than 4 in order for the inequality to hold, since otherwise b would be greater than 9 and not a single-digit integer. The only possibilities for a are thus 1, 2, and 3.

For $a=1$, we get b>$\frac{1}{2}$ for our inequality, and thus b can be any integer from 1 to 9.

For $a=2$, we get b>$\frac{8}{3}$ for our inequality, and thus b can be any integer from 3 to 9.

For $a=3$, we get b>$\frac{27}{4}$ for our inequality, and thus b can be any integer from 7 to 9.

Finally, if we total up all the possibilities we see there are 19 points that satisfy the condition, out of 9 $\times 9 = 81$ total points. The probability of picking a point that lies above the parabola is thus $\frac{19}{81} \rightarrow \boxed{\textbf{E}}$
## Video Solution
https://www.youtube.com/watch?v=u23iWcqbJlE
*~Shreyas S*

this links to problem 11...
## See also
