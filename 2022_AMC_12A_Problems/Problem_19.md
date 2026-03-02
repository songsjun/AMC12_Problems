# 2022 AMC 12A Problem 19

> This problem is the same as [2022 AMC 10A #22](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10A_Problems/Problem_22) and [2022 AMC 12A #19](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12A_Problems/Problem_19).
## Problem
Suppose that $13$ cards numbered $1, 2, 3, \ldots, 13$ are arranged in a row. The task is to pick them up in numerically increasing order, working repeatedly from left to right. In the example below, cards $1, 2, 3$ are picked up on the first pass, $4$ and $5$ on the second pass, $6$ on the third pass, $7, 8, 9, 10$ on the fourth pass, and $11, 12, 13$ on the fifth pass. For how many of the $13!$ possible orderings of the cards will the $13$ cards be picked up in exactly two passes?

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(11cm);
draw((0,0)--(2,0)--(2,3)--(0,3)--cycle);
label("7", (1,1.5));
draw((3,0)--(5,0)--(5,3)--(3,3)--cycle);
label("11", (4,1.5));
draw((6,0)--(8,0)--(8,3)--(6,3)--cycle);
label("8", (7,1.5));
draw((9,0)--(11,0)--(11,3)--(9,3)--cycle);
label("6", (10,1.5));
draw((12,0)--(14,0)--(14,3)--(12,3)--cycle);
label("4", (13,1.5));
draw((15,0)--(17,0)--(17,3)--(15,3)--cycle);
label("5", (16,1.5));
draw((18,0)--(20,0)--(20,3)--(18,3)--cycle);
label("9", (19,1.5));
draw((21,0)--(23,0)--(23,3)--(21,3)--cycle);
label("12", (22,1.5));
draw((24,0)--(26,0)--(26,3)--(24,3)--cycle);
label("1", (25,1.5));
draw((27,0)--(29,0)--(29,3)--(27,3)--cycle);
label("13", (28,1.5));
draw((30,0)--(32,0)--(32,3)--(30,3)--cycle);
label("10", (31,1.5));
draw((33,0)--(35,0)--(35,3)--(33,3)--cycle);
label("2", (34,1.5));
draw((36,0)--(38,0)--(38,3)--(36,3)--cycle);
label("3", (37,1.5));
```

</asy>
$\textbf{(A) } 4082 \qquad \textbf{(B) } 4095 \qquad \textbf{(C) } 4096 \qquad \textbf{(D) } 8178 \qquad \textbf{(E) } 8191$
## Solution 1 (Casework)
For $\leq \leq 12,$ suppose that cards $1, 2, \ldots, k$ are picked up on the first pass. It follows that cards $k+1,k+2,\ldots,13$ are picked up on the second pass.

<b>Once we pick the spots for the cards on the first pass, there is only one way to arrange all $\boldsymbol{13}$ cards.</b>

For each value of $k,$ there are $\binom{13}{k}-1$ ways to pick the $k$ spots for the cards on the first pass: We exclude the arrangement
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(11cm);
draw((0,0)--(2,0)--(2,3)--(0,3)--cycle);
label("1", (1,1.5));
draw((3,0)--(5,0)--(5,3)--(3,3)--cycle);
label("2", (4,1.5));
draw((6,0)--(8,0)--(8,3)--(6,3)--cycle);
label("3", (7,1.5));
draw((9,0)--(11,0)--(11,3)--(9,3)--cycle);
label("4", (10,1.5));
draw((12,0)--(14,0)--(14,3)--(12,3)--cycle);
label("5", (13,1.5));
draw((15,0)--(17,0)--(17,3)--(15,3)--cycle);
label("6", (16,1.5));
draw((18,0)--(20,0)--(20,3)--(18,3)--cycle);
label("7", (19,1.5));
draw((21,0)--(23,0)--(23,3)--(21,3)--cycle);
label("8", (22,1.5));
draw((24,0)--(26,0)--(26,3)--(24,3)--cycle);
label("9", (25,1.5));
draw((27,0)--(29,0)--(29,3)--(27,3)--cycle);
label("10", (28,1.5));
draw((30,0)--(32,0)--(32,3)--(30,3)--cycle);
label("11", (31,1.5));
draw((33,0)--(35,0)--(35,3)--(33,3)--cycle);
label("12", (34,1.5));
draw((36,0)--(38,0)--(38,3)--(36,3)--cycle);
label("13", (37,1.5));
```

</asy>
in which the cards are arranged such that the first pass consists of all $13$ cards.

Therefore, the answer is

$$\sum_{k=1}^{12}\left[\binom{13}{k}-1\right] = \left[\sum_{k=1}^{12}\binom{13}{k}\right]-12 = \left[\sum_{k=0}^{13}\binom{13}{k}\right]-14 = 2^{13} - 14 = \boxed{\textbf{(D) } 8178}.$$


*~MRENTHUSIASM*
## Solution 2 (Casework)
Since the $13$ cards are picked up in two passes, the first pass must pick up the first $n$ cards and the second pass must pick up the remaining cards $m$ through $13$.
Also note that if $m$, which is the card that is numbered one more than $n$, is placed before $n$, then $m$ will not be picked up on the first pass since cards are picked up in order. Therefore we desire $m$ to be placed before $n$ to create a second pass, and that after the first pass, the numbers $m$ through $13$ are lined up in order from least to greatest.

To construct this, $n$ cannot go in the $n$th position because all cards $1$ to $n-1$ will have to precede it and there will be no room for $m$. Therefore $n$ must be in slots $n+1$ to $13$.
Let's do casework on which slot $n$ goes into to get a general idea for how the problem works.

**Case 1:** With $n$ in spot $n+1$, there are $n$ available slots before $n$, and there are $n-1$ cards preceding $n$. Therefore the number of ways to reserve these slots for the $n-1$ cards is $\binom{n}{n-1}$. Then there is only $1$ way to order these cards (since we want them in increasing order). Then card $m$ goes into whatever slot is remaining, and the $13-m$ cards are ordered in increasing order after slot $n+1$, giving only $1$ way. Therefore in this case there are $\binom{n}{n-1}$ possibilities.

**Case 2:** With $n$ in spot $n+2$, there are $n+1$ available slots before $n$, and there are $n-1$ cards preceding $n$. Therefore the number of ways to reserve slots for these cards are $\binom{n+1}{n-1}$. Then there is one way to order these cards. Then cards $m$ and $m+1$ must go in the remaining two slots, and there is only one way to order them since they must be in increasing order. Finally, cards $m+2 to 13$ will be ordered in increasing order after slot $n+1$, which yields $1$ way. Therefore, this case has $\binom{n+1}{n-1}$ possibilities.

I think we can see a general pattern now. With $n$ in slot $x$, there are $x-1$ slots to distribute to the previous $n-1$ cards, which can be done in $\binom{x-1}{n-1}$ ways. Then the remaining cards fill in in just $1$ way. Since the cases of $n$ start in slot $n+1$ and end in slot $13$, this sum amounts to:


$$\binom{n}{n-1}+\binom{n+1}{n-1}+\binom{n+2}{n-1} + \cdots + \binom{12}{n-1}$$

 for any $n$.

Hmmm ... where have we seen this before?

We use wishful thinking to add a term of $\binom{n-1}{n-1}$:


$$\binom{n-1}{n-1}+\binom{n}{n-1}+\binom{n+1}{n-1}+\binom{n+2}{n-1} + \cdots + \binom{12}{n-1}$$


This is just the hockey stick identity! Applying it, this expression is equal to $\binom{13}{n}$. However, we added an extra term, so subtracting it off, the total number of ways to order the $13$ cards for any $n$ is

$$\binom{13}{n}-1$$


Finally, to calculate the total for all $n$, we sum from $n=0 to 13$. This yields us:


$$\sum_{n=0}^{13} \binom{13}{n}-1 \implies \sum_{n=0}^{13} \binom{13}{n} - \sum_{n=0}^{13} 1$$


$$\implies 2^{13} - 14 = 8192 - 14 = 8178 = \boxed{\textbf{(D) } 8178}.$$


*~KingRavi*
## Solution 3 (Recursion)
To solve this problem, we can use recursion on $n$. Let $A_n$ be the number of arrangements for $n$ numbers. Now, let's look at how these arrangements are related to $A_{n-1}$ by case work on the first number $a_1$.

If $a_1 = 1$, the remaining $n-1$ numbers from $2$ to $n$ are arranged in the same way just like number 1 to $n-1$ in the case of $n-1$ numbers. So there are $A_{n-1}$ arrangements.

If $a_1 = 2$, then we need to choose 1 position from position 2 to $n-1$ to put 1, and all remaining numbers must be arranged in increasing order, so there are $\binom{n-1}{1}$ such arrangements.

If $a_1 = k$, then we need to choose $k-1$ positions from position 2 to $n-1$ to put $1, 2,\cdots k-1$, and all remaining numbers must be arranged in increasing order, so there are $\binom{n-1}{k-1}$ such arrangements.

So we can write


$$A_n = A_{n-1} + \binom{n-1}{1} + \binom{n-1}{2} + \cdots + \binom{n-1}{n-1}$$


which can be simplified to


$$A_n = A_{n-1} + 2^{n-1} - 1$$


We can solve this recursive sequence by summing up $n-1$ lines of the recursive formula


$$A_n - A_{n-1} = 2^{n-1} - 1$$


$$A_{n-1} - A_{n-2} = 2^{n-2} - 1$$


$$\cdots$$


$$A_2 - A_{1} = 2^{1} - 1$$


to get


$$A_n - A_1 = \sum_{k=1}^{n-1} (2^k - 1) = 2^n - 2 - (n-1) = 2^n - n - 1$$


since $A_1=0$, we have


$$A_n = 2^n - n - 1$$


and $A_{13} = 2^{13} - 14 = \boxed{\textbf{(D) } 8178}$.


-- Dan Li
## Solution 4 (Engineer's Induction)
When we have $3$ cards arranged in a row, after listing out all possible arrangements, we see that we have $4$ arrangements: $(1, 3, 2), (2, 1, 3), (2, 3, 1),$ and $(3, 1, 2)$. When we have $4$ cards, we find $11$ possible arrangements: $(1, 2, 4, 3), (1, 3, 2, 4), (1, 3, 4, 2), (1, 4, 2, 3), (2, 1, 3, 4), (2, 3, 1, 4), (2, 3, 4, 1), (3, 1, 2, 4), (3, 1, 4, 2), (3, 4, 1, 2),$ and $(4, 1, 2, 3).$ Hence, we recognize the pattern that for $n$ cards, we have $2^n - n - 1$ valid arrangements, so our answer is $2^{13} - 13 - 1 = \boxed{\textbf{(D) } 8178}.$ Note that this also works for $2$ cards being arranged in a row. $(2,1)$ Here, only one works, and following the formula, it checks out.

*~eibc ~LoadingNoob*
## Solution 5 (Subsets Bijection)
Notice that for each card "position", we can choose for it to be picked up on the first or second pass, for a total of $2^{13}$ options. However, if all of the cards selected to be picked up first are before all of the cards to be picked up second, then this means that the list is in consecutive ascending order (and thus all cards will be picked up on the first pass instead). This can happen in 14 ways, so our answer is $2^{13}\boxed{\textbf{(D) } 8178}$.

*~pooh_bear*
## Solution 6 (10 Seconds Solution)
To satisfy the condition the question provided, we can arrange the numbers between 1 and 13 into 3 groups. Though writing out the groups is not necessary, below is a basic 'format'.
(# of elements in 1st group, # of elements in the 2nd group, # of elements in the 3rd group)
(1,1,11)

$$
=(1,2,10)
=(1,3,9)
=(1,4,8)
=(1,5,7)
=(1,6,6)
=(2,2,9)
=(2,3,8)
=(2,4,7)
=(2,3,8)
=(2,4,7)
=(2,5,6)
=(3,3,7)
=(3,4,6)
=(3,5,5)
$$


Then to arrange these groups we need to multiply the final value by 3!. Hence, we know that the answer should be a multiple of 3!, which is 6. Since D is the only answer choice that is a multiple of 6, the answer is $\boxed{D}$.
*~minor edit(Marshall_Huang)*
## Video Solution (Interactive Teaching Approach)
https://www.youtube.com/watch?v=AVRo_ZbqfUE

*~MathkidsbyMax*
## Video Solution
https://youtu.be/j2J_m2N7-hI

<i>~Education, the Study of Everything</i>
## Video Solution by ThePuzzlr
https://youtu.be/p9xNduqTKLM

*~MathIsChess*
## Video Solution by OmegaLearn (Combinatorial Identities and Overcounting)
https://youtu.be/gW8gPEEHSfU

*~pi_is_3.14*
## Video Solution by Steven Chen
https://youtu.be/ZGqrs5eg6-s

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by MRENTHUSIASM (English & Chinese)
https://youtu.be/XZ4HuX-WUN4

*~MRENTHUSIASM*
## Video Solution by Math-X (Smart and Simple)
https://youtu.be/7yAh4MtJ8a8?si=BzGQ7jkWHjlZOmpw&t=5547

*~Math-X*
## See Also
