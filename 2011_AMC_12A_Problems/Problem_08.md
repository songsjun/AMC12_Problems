# 2011 AMC 12A Problem 8

## Problem
In the eight term sequence A, B, C, D, E, F, G, H, the value of C is 5 and the sum of any three consecutive terms is 30. What is A+H?

$\textbf{(A)}\ 17 \qquad \textbf{(B)}\ 18 \qquad \textbf{(C)}\ 25 \qquad \textbf{(D)}\ 26 \qquad \textbf{(E)}\ 43$
## Solution 1
Let A=x. Then from A+B+C=30, we find that B=25-x. From B+C+D=30, we then get that D=x. Continuing this pattern, we find E=25-x, F=5, G=x, and finally H=25-x. So A+H=$x+25-x=25\rightarrow \boxed{\textbf{C}}$
## Solution 2
Given that the sum of 3 consecutive terms is 30, we have
(A+B+C)+(C+D+E)+(F+G+H)=90 and (B+C+D)+(E+F+G)=60

It follows that A+B+C+D+E+F+G+H=85 because C=5.

Subtracting, we have that A+H=$25\rightarrow \boxed{\textbf{C}}.$
## Solution 3 (the tedious one)
From the given information, we can deduce the following equations:

A+B=25, B+D=25, D+E=25, D+E+F=30, E+F+G =30, and F+G+H=30.

We can then cleverly manipulate the equations above by adding and subtracting them to be left with the answer.

$$(A+B)-(B+D)=25-25 \implies (A-D)=0$$

$$(A-D)+(D+E)=0+25 \implies (A+E)=25$$

(A+E)-(E+F+G)=25-30 $\implies (A-F-G)=-5 ($Notice how we don't use D+E+F=30)

$$(A-F-G)+(F+G+H)=-5+30 \implies (A+H)=25$$

Therefore, we have A+H=25 $\rightarrow \boxed{\textbf{C}}$

*~JinhoK*
## Solution 4 (the cheap one)
Since all of the answer choices are constants, it shouldn't matter what we pick A and B to be, so let A = 20 and B = 5. Then D = 30 - B -C = 20, E = 30 - D - C = 5, F = 30 - D - E =5, and so on until we get H = 5. Thus A + H = $\boxed{\mathbf{(C)}25}$
## Solution 5
Notice that the period of the sequence is 3 as given. (If this isn't clear we can show an example: A+B+C=B+C=D \Leftrightarrow A=D). Then A=D and H=B, so A+H=D+B=D+B+C-C=$30-5=\boxed{\textbf{(C)}\;25}.$

*~eevee9406*
## Solution 6
Since the period of the sequence is 3 A=D=G, B=E=H, C=F
A+B+C=30 because any three consecutive terms sum to 30.
Since C=5 A+B=25
Since B=H A+B=A+H=\fbox{(C) 25}

*~sid2012 [https://artofproblemsolving.com/wiki/index.php/User:Sid2012]*
## Note
Something useful to shorten a lot of the solutions above is to notice 5 + D + E = D + E + F so F = 5
## Video Solution
https://www.youtube.com/watch?v=6tlqpAcmbz4
*~Shreyas S*
## Podcast Solution
https://www.buzzsprout.com/56982/episodes/383730 (Episode starts with a solution to this question)
—wescarroll
## See also
