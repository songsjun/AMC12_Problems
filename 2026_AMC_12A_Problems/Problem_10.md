# 2026 AMC 12A Problem 10

> This problem is the same as [2026 AMC 10A #15](https://artofproblemsolving.com/wiki/index.php/2026_AMC_10A_Problems/Problem_15) and [2026 AMC 12A #10](https://artofproblemsolving.com/wiki/index.php/2026_AMC_12A_Problems/Problem_10).

## Problem
The tree diagram below has nodes labeled with rational numbers. The top node, at level 0, is $\frac{1}{2}$. Each node $\frac{a}{b}$ sprouts two nodes in the level below it, $\frac{a}{a+b}$ and $\frac{b}{a+b}$. For example, level $1$ has nodes $\frac{1}{1+2} = \frac{1}{3}$ and $\frac{2}{1+2} = \frac{2}{3}$.



![AoPS diagram 1](../2026_AMC_12A_Problems/media/problem-10-diagram-01.svg)



At what level does the node $\frac{20}{27}$ appear in the diagram?



$$
\textbf{(A)}\   5  \qquad
	\textbf{(B)}\   8  \qquad
	\textbf{(C)}\   12  \qquad
	\textbf{(D)}\   26  \qquad
	\textbf{(E)}\   \text{The node } \dfrac{20}{27} \text{ does not appear in the diagram.}
$$



## Solution 1
We work backwards. $\frac{20}{27}$ must be below $\frac{7}{20},$ since $\frac{7}{20}$ splits into $\frac{7}{27}$ and $\frac{20}{27}.$ Likewise, we have the chain 


$$
\frac{20}{27}\implies\frac{7}{20}\implies\frac{7}{13}\implies\frac{6}{7}\implies\frac{1}{6}\implies\frac{1}{5},
$$


where, in the diagram, $\frac{1}{5}$ appears in level $3.$ Thus, $\frac{20}{27}$ appears in level $\boxed{\text{(B) 8}}$ ~Arjun_Jetti

Note: You could try to solve your way down, but it would take a lot of time and effort, which you don't want to waste on this competition ~ hellokindsir

Other Note: However, if you work from left to right, the first node you would work on would be 1/5, so you get lucky there. ~Starlight_128

## Solution 2
If $\frac{a}{a+b}$ is emerged from a node, so is $\frac{b}{a+b}$.

Hence, since $\frac{20}{27}$ comes from a node, so does $\frac{7}{27}$. The result is $\frac{7}{20}$.

Since $\frac{7}{20}$ is a node, so is $\frac{13}{20}$, so it emerges from $\frac{7}{13}$.

Since $\frac{7}{13}$ is a node, so is $\frac{6}{13}$, so it emerges from $\frac{6}{7}$.

Since $\frac{6}{7}$ is a node, so is $\frac{1}{7}$, hence $\frac{1}{6}$.

From here, it is easy to see we have $\frac{1}{5}, \frac{1}{4}, \frac{1}{3},$ and finally $\frac{1}{2}$.

Therefore, counting down from 0, it appears on layer $\boxed{8}$.

~Pinotation

## Solution 3
First, let's define neighboring fractions as fractions that have the same number above them (like $1/3$ and $2/3$, or $1/4$ and $3/4$). Each fraction $\frac{a}{b}$ sprouts two fractions $\frac{a}{a+b}$ and $\frac{b}{a+b}$ that add up to $\frac{a+b}{a+b}=1$.

From this, we see that the neighbor of $\frac{20}{27}$ is $\frac{7}{27}$. Working backwards, the fraction above it is the ratio of the two fractions' numerators, $\frac{7}{20}$.

We repeat this process:
- $7/20$'s neighbor: $13/20$
** The fraction above: $7/13$
- $7/13$'s neighbor: $6/13$
** The fraction above: $6/7$
- $6/7$'s neighbor: $1/7$
** The fraction above: $1/6$
- $1/6$'s neighbor: $5/6$
** The fraction above: $1/5$

We see that $1/5$ appears in our diagram in level 3.
Therefore, working backwards, $20/27$ appears in level 8, so the answer is $\boxed{\text{(B) 8}}$.

~mehta0edu

~[Icosahedron0288](https://artofproblemsolving.com/wiki/index.php/User：Icosahedron0288#Created_Pages)

~minor edits by Squishy64

## Solution 3.1
Each fraction has only one possible fraction it can originate from, so if we start with $\dfrac{20}{27}$, it can only come from $\dfrac{7}{13}$, and that comes from $\dfrac{6}{7}$ which comes from $\dfrac{1}{6}$ which comes from $\dfrac{1}{5}$. (This is just here because I felt the above solution was somewhat confusing)

~ToxicWaste. Also lets be honest, all of the solutions except #4 are the same, just with different wording. 

~minor edits by Squishy64, Remark: This should be a remark.

## Solution 4 (Cheese)
Notice that answer choice $B$ is exactly 3 more than $A$. The original problem had three pre-established "levels" in the branch, so we can imply that MAA (or ai or whoever made the test) was trying to trick the people who didn't add the original three "levels". Therefore, the answer is $\boxed{\text{(B) 8}}$.

~N0lan

~minor edits by Squishy64

~Cheese approved by Bwn

## Solution 5 (Analyzing Option Choices)
At level $n$, any node $\frac{a}{b}$ satisfies the denominator bounds:


$$
n + 2 \leq b \leq F_{n+3}
$$


where $F_3 = 2, F_4 = 3, F_5 = 5, \dots$ are the Fibonacci numbers. Testing $b = 27$ against the options:

- **Eliminate (E):** Since $\gcd(20, 27) = 1$ and $20 < 27$, Euclidean subtraction reduces $\frac{20}{27}$ to $\frac{1}{2}$, so it must appear in the tree.
- **Eliminate (D) $26$:** The minimum denominator at level $26$ is $26 + 2 = 28 > 27$.
- **Eliminate (A) $5$:** The maximum denominator at level $5$ is $F_8 = 21 < 27$.
- **Eliminate (C) $12$:** Reaching $b = 27$ at level $12$ requires staying near the leftmost path ($\frac{1}{14}$), which keeps the numerator far below $20$.

Thus, $\boxed{8}$ is the only possible answer.

~Horseneck3

## Solution 6 (No more time left)
Using the established diagram, we figure the largest possible denominator in level 5 is 21. We immediately eliminate $A$. If we do understand how quickly this pattern moves forward, row 8 should probably cover $\frac{20}{27}$, so we can guess $\boxed{\text{(B) 8}}$. If you are skeptical, you may consider how inflated the numerator and denominator values may be in row 12 and that many AMC 10 questions won't have an answer like $E$ be correct.

~Gumbo_The_Fox

~$\LaTeX$ fixes hothost59

~$\LaTeX$ fixes by Squishy64

## Remark
This setup is very similar to the [Calkin-Wilf Tree](https://en.wikipedia.org/wiki/Calkin%E2%80%93Wilf_tree), which also contains all rational numbers, but rather than having $\frac{b}{a+b}$, it uses $\frac{a+b}{b}$.

## Video Solution 1 by MathIsFun
https://youtu.be/JRWnRtZNW9o?si=SXu2kYb5y8BSmJ-b&t=1589

## Video Solution 2 by MadMath
https://youtu.be/YuX-DZTXisI

## Video Solution 3 by TechMath Thinker
https://youtu.be/7hBDU2LNWrs

~midnight_rain

## Video Solution 4 by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ

## Video Solution 5 by MathWhile
https://youtu.be/PerJ4zD77ug?t=715
