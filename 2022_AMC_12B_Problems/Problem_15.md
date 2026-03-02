# 2022 AMC 12B Problem 15

> This problem is the same as [2022 AMC 10B #17](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10B_Problems/Problem_17) and [2022 AMC 12B #15](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_15).
## Problem
One of the following numbers is not divisible by any prime number less than $10.$ Which is it?

$\textbf{(A) } 2^{606}-1 \qquad\textbf{(B) } 2^{606}+1 \qquad\textbf{(C) } 2^{607}-1 \qquad\textbf{(D) } 2^{607}+1\qquad\textbf{(E) } 2^{607}+3^{607}$
## Solution 1 (Modular Arithmetic)
For $\textbf{(A)}$ modulo $3,$


$$\begin{align*}

$$
2^{606} - 1 & \equiv (-1)^{606} - 1 \\
& \equiv 1 - 1 \\
& \equiv 0 .
$$

$\end{align*}$$$


Thus, $2^{606} - 1$ is divisible by $3.$

For $\textbf{(B)}$ modulo $5,$


$$\begin{align*}
$2^{606} + $1 & $\equiv 2^{{\rm Rem} ( 606, \phi(5) )} + 1$ \\
& $\equiv 2^{{\rm Rem} ( 606, 4 )} + 1$ \\

$$
& \equiv 2^2 + 1 \\
& \equiv 0 .
$$

$\end{align*}$$$


Thus, $2^{606} + 1$ is divisible by $5.$

For $\textbf{(D)}$ modulo $3,$


$$\begin{align*}

$$
2^{607} + 1 & \equiv (-1)^{607} + 1 \\
& \equiv - 1 + 1 \\
& \equiv 0 .
$$

$\end{align*}$$$


Thus, $2^{607} + 1$ is divisible by $3.$

For $\textbf{(E)}$ modulo $5,$


$$\begin{align*}

$$
2^{607} + 3^{607}
& \equiv 2^{607} + (-2)^{607} \\
& \equiv 2^{607} - 2^{607} \\
& \equiv 0 .
$$

$\end{align*}$$$


Thus, $2^{607} + 3^{607}$ is divisible by $5.$

Therefore, the answer is $\boxed{\textbf{(C) }2^{607} - 1}.$

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*

*~MrThinker (LaTeX Error)*
## Solution 2 (Factoring)
We have


$$\begin{alignat*}{8}

$$
2^{606}-1 &= 4^{303}-1 &&= (4-1)(4^{302}+4^{301}+4^{300}+\cdots+4^0), \\
2^{606}+1 &= 4^{303}+1 &&= (4+1)(4^{302}-4^{301}+4^{300}-\cdots+4^0), \\
2^{607}+1 & &&= (2+1)(2^{606}-2^{605}+2^{604}-\cdots+2^0), \\
2^{607}+3^{607} & &&= (2+3)(2^{606}\cdot3^0-2^{605}\cdot3^1+2^{604}\cdot3^2-\cdots+2^0\cdot3^{606}).
$$

$\end{alignat*}$$$


We conclude that $\textbf{(A)}$ is divisible by $3$, $\textbf{(B)}$ is divisible by $5$,$\textbf{(D)}$ is divisible by $3$, and $\textbf{(E)}$ is divisible by $5$.

Since all of the other choices have been eliminated, we are left with $\boxed{\textbf{(C) } 2^{607}-1}$.

*~not_slay*
## Solution 3 (Elimination)
Mersenne Primes are primes of the form $2^n-1$, where $n$ is prime. Using the process of elimination, we can eliminate every option except for $\textbf{(A)}$ and $\textbf{(C)}$. Clearly, $606$ isn't prime, so the answer must be $\boxed{\textbf{(C) }2^{607}-1}$.

Note: A organization of computer scientist and mathematicians named Great Internet Mersenne Prime Search (GIMPS) search for the worlds biggest prime numbers. More information can be found on https://www.mersenne.org/primes/
*~hashbrown2009*
## Solution 3a (Elimination)
We examine option E first. $2^{607}$ has a units digit of $8$ (Taking the units digit of the first few powers of two gives a pattern of $2, 4, 8, 6, 2, 4, 8, 6, 2, 4, 8, 6,\cdots$) and $3^{607}$ has a units digit of $7$ (Taking the units digit of the first few powers of three gives a pattern of $3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1,\cdots$). Adding $7$ and $8$ together, we get $15$, which is a multiple of $5$, meaning that $2^{607}+3^{607}$ is divisible by 5.

Next, we examine option D. We take the first few powers of $2$ added with $1$:


$$2^1+1=3$$


$$2^2+1=5$$


$$2^3+1=9$$


$$2^4+1=17$$


$$2^5+1=33$$


$$2^6+1=65$$


$$2^7+1=129$$


We see that the odd powers of $2$ added with 1 are multiples of three. If we continue this pattern, $2^{607}+1$ will be divisible by $3$. (The reason why this pattern works: When you multiply $2 \equiv2\pmod{3}$ by $2$, you obtain $4 \equiv1 \pmod{3}$. Multiplying by $2$ again, we get $\cdot2\equiv2 \pmod{3}$. We see that in every cycle of two powers of $2$, it goes from $2 \pmod{3}$ to $1 \pmod{3}$ and back to $2 \pmod{3}$.)

Next, we examine option B. We see that $2^{606}$ has a units of digits of $4$ (Taking the units digit of the first few powers of two gives a pattern of $2, 4, 8, 6, 2, 4, 8, 6, 2, 4, 8, 6,\cdots$). Adding $1$ to $4$, we get $5$. Since $2^{606}+1$ has a units digit of $5$, it is divisible by $5$.

Lastly, we examine option A. Using the difference of cubes factorization $a^3-b^3=(a-b)(a^2+ab+b^2)$, we have $2^{606}-1^3=(2^{202}-1)(2^{404}+2^{202}+1)$. Since $2^{404}+2^{202}+1\equiv0\pmod{3}$ (Every term in the sequence is equivalent to $\pmod{3}), 2^{606}-1$ is divisible by $3$.

Since we have eliminated every option except C, $\boxed{\text{(C)} \hspace{0.1 in}2^{607}-1}$ is not divisible by any prime less than $10$.

*~arjken (+ minor LaTeX edits ~TaeKim)*
## Solution 3b (Elimination + Number Theory)
We know that the prime numbers less than 10 are $2,3,5$ and $7$. We can start by testing if any of the answer choices are divisible by $2$. We see that they are all sums of one even number and one odd number, which is simply odd. So, we cannot exclude any answer choices so far. Now, let's check divisibility by $3$. We can use the fact that $2 \equiv -1 \pmod{3}$ to our advantage:


$(\text{A})\hspace{0.1in} 2^{606}-1$
$\equiv (-1)^{606} -1$
$\equiv 1-1$
$\equiv 0 \pmod{3}$


$(\text{B}) \hspace{0.1in} 2^{606}+1$
$\equiv (-1)^{606} +1$
$\equiv 1+1$
$\equiv 2 \pmod{3}$


$(\text{C})\hspace{0.1in} 2^{607}-1$
$\equiv (-1)^{607} -1$
$\equiv -1 - 1$
$\equiv -2 \pmod{3}$


$(\text{D})\hspace{0.1in} 2^{607} +1 \equiv (-1)^{607} +1 \equiv -1+1 \equiv 0 \pmod{3}$


$(\text{E}) \hspace{0.1in}  2^{607} + 3^{607} \equiv 2^{607} \equiv (-1)^{607} \equiv -1 \pmod{3}$


So, we eliminate choices A and D from divisibility by 3. Now, we move onto divisibility by 5. We can use cycling of powers to find useful remainders. Let's start with choice $B$.


$(\text{B}) \hspace{0.1in} 2^{606}+1$


We see that the remainders of powers of $2$ when divided by $5$ cycle in a pattern: $2,4,3,1,2,4,3,1 \dots$. Since the pattern cycles every 4 terms, we use modulo 4 to simplify 606, getting that $606 \equiv 2\pmod{4}$. So, we get that $2^{606}$ is congruent modulo 5 to the second term of our pattern, so $2^{606} \equiv{4} \pmod{5}$. Thus, $2^{606}+1 \equiv 4+1 \equiv 5\equiv 0\pmod{5}$. We now eliminate choice B and compare choices C and E.


$(\text{E}) \hspace{0.1in} 2^{607} + 3^{607}$


Looking at choice E, we see that we have to do similar cycling for powers of $3$. We get a pattern of $3,4,2,1,3,4,2,1 \dots$. Since this pattern also cycles every 4 terms, we use modulo 4 to simplify 607, getting that $607 \equiv 3\pmod{4}$. Both the power of 3 and the power of 2 have an exponent of 607, so we use the third term (since we just found that $607 \equiv 3\pmod{4}$) in each corresponding 4 term pattern to get that $2^{607} + 3^{607} \equiv 3+2 \equiv 5 \equiv 0\pmod{5}$. We eliminate choice E, and we are left with the correct answer: choice $\boxed{(\text{C}) \hspace{0.1in} 2^{607}-1}$


*~TaeKim*
## Solution 4 (modulo 15 elimination)
We proceed by taking the solutions modulo $15$, allowing us to eliminate both multiples of $3$ and multiples of $5$.

First, we must identify cycles of powers of 2 modulo 15.
$2^0 \equiv 1, \quad 2^1 \equiv 2, \quad 2^2 \equiv 4, \quad 2^3 \equiv 8, \quad 2^4 \equiv 1 \pmod{15}.$
Thus, the pattern repeats every $4$ powers:
$2^n \equiv

$$
\begin{cases}
1 &\text{if } n \equiv 0 \pmod{4},\\
2 &\text{if } n \equiv 1 \pmod{4},\\
4 &\text{if } n \equiv 2 \pmod{4},\\
8 &\text{if } n \equiv 3 \pmod{4}.
\end{cases}$
$$


Since $606 \equiv 2 \pmod{4}$ and $607 \equiv 3 \pmod{4}$,
$2^{606} \equiv 4 \pmod{15}, \qquad 2^{607} \equiv 8 \pmod{15}.$

Now let's look at cycles of powers of 3 mod 15.
$3^0 \equiv 1, \quad 3^1 \equiv 3, \quad 3^2 \equiv 9, \quad 3^3 \equiv 12, \quad 3^4 \equiv 6, \quad 3^5 \equiv 3 \pmod{15}.$
The cycle from here repeats every $4$ terms for $n \ge 1$:
$3^n \equiv

$$
\begin{cases}
6 &\text{if } n \equiv 0 \pmod{4},\\
3 &\text{if } n \equiv 1 \pmod{4},\\
9 &\text{if } n \equiv 2 \pmod{4},\\
12 &\text{if } n \equiv 3 \pmod{4}.
\end{cases}$
$$


Since $607 \equiv 3 \pmod{4}$,
$3^{607} \equiv 12 \pmod{15}$.

We then evaluate each option modulo 15.

$$\begin{aligned}$$
$\textbf{(A)} &:\; 2^{606}-1 \equiv 4-1 \equiv 3 \pmod{15},\$$6pt]$
$\textbf{(B)} &:\; 2^{606}+1 \equiv 4+1 \equiv 5 \pmod{15},\$$6pt]$
$\textbf{(C)} &:\; 2^{607}-1 \equiv 8-1 \equiv 7 \pmod{15},\$$6pt]$
$\textbf{(D)} &:\; 2^{607}+1 \equiv 8+1 \equiv 9 \pmod{15},\$$6pt]$
$\textbf{(E)} &:\; 2^{607}+3^{607} \equiv 8+12 \equiv 20 \equiv 5 \pmod{15}.$
$\end{aligned}$

The residues divisible by $3$ or $5$ modulo $15$ are 0, 3, 5, 6, 9, 10, 12.
Among our results, only $7$ (from option $\boxed{(\text{C})}$) is not among these, eliminating all the other answer choices.


$\boxed{(\text{C}) \hspace{0.1in} 2^{607}-1}$ is the number not divisible by any prime less than $10$. \\
*~Loquacious_Autodidact*
## Solution 5 (Extremely Illegal Cheese)
All of the other solutions are extremely long, but this is how to cheese it using some methods that MIGHT be unreliable:
First, turn 606 to 0 and 607 to 1. Next, Calculate each value, giving you $A=0 B=2 C=1 D=3 E=5$. Now since 2, 3, and 5 are prime, they can be divided by a prime(themselves). 0 doesn't really have multiples, so you can literally ignore it, and since 1 is only divisible by 1, which isnt prime, you get the correct answer, $\boxed{(\text{C})}$.

*~SIGMAMATHEMATICIAN*
## Video Solution by mop 2024
https://youtu.be/ezGvZgBLe8k&t=577s

*~r00tsOfUnity*
## Video Solution
https://youtu.be/YF3HPVcVGZk

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by OmegaLearn Using Digit Cycles
https://youtu.be/k4eLhi9wXO8

*~pi_is_3.14*
## Video Solution(1-16)
https://youtu.be/SCwQ9jUfr0g

~~Hayabusa1
## Video Solution by Interstigation
https://youtu.be/NSGUJJYD8KA

*~Interstigation*
## Video Solution by TheBeautyofMath
https://youtu.be/UQWqjI4G1hc

*~IceMatrix*
## See Also
