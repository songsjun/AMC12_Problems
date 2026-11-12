# 2026 AMC 12A Problem 4

> This problem is the same as [2026 AMC 10A #5](https://artofproblemsolving.com/wiki/index.php/2026_AMC_10A_Problems/Problem_5) and [2026 AMC 12A #4](https://artofproblemsolving.com/wiki/index.php/2026_AMC_12A_Problems/Problem_4).

## Problem
Let $a_{1}, a_{2}, a_{3}$, $\dots$ be a sequence with $a_{1} = 94$, $a_{2} = 190$, and $a_{n}$ equal to the arithmetic mean of the previous $n-1$ terms for $n \ge 3$. What is the value of $a_{10}$?

$\textbf{(A)}\   47  \qquad 	\textbf{(B)}\   95  \qquad 	\textbf{(C)}\   142  \qquad 	\textbf{(D)}\   284  \qquad 	\textbf{(E)}\   564$

## Solution 1
By the definition of the sequence, $a_3 = \frac{94+190}{2} = 142$, $a_4 = \frac{94+190+142}{3} = 142$, and so on. Trying a few more terms keeps giving us 142 and it never changes, so the answer is $\boxed{\textbf{(C)}\hspace{1mm}142}$
$\newline$
$\sim$cyrus825

minor $\LaTeX$ edits by ~singularity1

## Solution 2
For $n>3,$ we have 

$$
a_{n-1} = \dfrac{a_{n-2}+a_{n-3}+...+a_1}{n-2}\implies a_{n-2}+a_{n-3}+...+a_1=(n-2)a_{n-1}.
$$



Then, 

$$
a_{n} = \dfrac{a_{n-1}+a_{n-2}+...+a_1}{n-1}=\dfrac{a_{n-1}+(n-2)a_{n-1}}{n-1}=a_{n-1}.
$$



Since $a_3 = \frac{94+190}{2}=142,$ we have 


$$
a_{10}=a_9=a_8=...=a_3=\boxed{\textbf{(C) }142}
$$


~Tacos_are_yummy_1

## Solution 3 (Analyzing Option Choices)
One can see that the average of $94$ and $190$ will be between $94$ and $190$, so $a_10$ will obviously be between $94$ and $190$. Looking at the option choices, we can see that only $95$ and $142$ are in between $94$ and $190$, and the average is in between $94$ and $190$, so cannot be $95$. Thus, the answer must be $\boxed{142}$

~Horseneck3

## Solution 4 (Understanding Arithmetic Mean)
It is known that adding a value equal to the arithmetic mean into a data set does not change the overall mean. A quick proof of the previous statement is as follows:

Let the mean of a set of $n$ numbers be $\overline{x}$. Adding $\overline{x}$ to the set of $n$ numbers yields the new sum: $n \cdot \overline{x} \rightarrow (n+1)\cdot \overline{x}$.

See that the total number of values increases from $n$ to $n+1$, and thus the new mean of the set of $n+1$ values gives $\frac{(n+1)\cdot \overline{x}}{n+1}= \overline{x}$.

Hence, in our problem, we need only find the arithmetic mean of the two initial values of the sequence. That is: $\frac{a_{1} + a_{2}}{2} = \frac{94+190}{2} = \boxed{142}$. 

~MaxTensen ~minor edits by chillydogs

## Video Solution 1
https://youtu.be/sNFSsL75LGE?t=535

~MathisFun

## Video Solution 2 by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ
