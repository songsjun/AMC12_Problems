# 2022 AMC 12A Problem 21

## Problem
Let P(x) = $x^{2022}+x^{1011} + 1$. Which of the following polynomials is a factor of P(x)?

$\textbf{(A)} \, x^2 -x + 1 \qquad\textbf{(B)} \, x^2 + x + 1 \qquad\textbf{(C)} \, x^4 + 1 \qquad\textbf{(D)} \, x^6 - x^3 + 1 \qquad\textbf{(E)} \, x^6 + x^3 + 1$
## Solution 1
P(x) = $x^{2022}+x^{1011} + 1$ is equal to $\frac{x^{3033}-1}{x^{1011}-1}$ by difference of powers.

Therefore, the answer is a polynomial that divides $x^{3033}-1$ but not $x^{1011}-1$.

Note that any polynomial $x^m-1$ divides $x^n-1$ if and only if m is a factor of n.

The prime factorizations of 1011 and 3033 are 3*337 and $3^2*337,$ respectively.

Hence, x^9-1 is a divisor of $x^{3033}-1$ but not $x^{1011}-1$.

By difference of powers, x^9-1=(x^3-1)(x^6+x^3+1).
Therefore, the answer is $\boxed{E}.$
## Solution 2
We simply test roots for each, as 2022,1011 are multiples of three, we need to make sure the roots are in the form of $e^{i\frac{k\pi}{9}}$, so we only have to look at D,E.

If we look at choice E, $x=e^{i\frac{\pm2\pi}{9}}$ which works perfectly, the answer is just E.

*~bluesoul*
## Solution 3
Let $x^{1011}$ = u, now we can rewrite our polynomial as $u^2+u+1$. Using the quadratic formula to solve for the roots of this polynomial, we have $x^{1011}=\frac{-1\pm i\sqrt{3}}{2}$ Looking at our answer choices, we want to find a polynomial whose roots satisfy this expression. Since the expression $x^6+x^3+1$ is in a similar form to our original polynomial, except with $x^3 in$ place of $x^{1011}$, this would be a good place to start. Solving for the roots of $x^3 in a$ similar fashion, $x^3=\frac{-1\pm i\sqrt{3}}{2}$ for the solution we are testing. Now notice that we can rewrite the roots of $x^3$ as $x^3 =$ \operatorname{cis}{$\frac{2\pi}{3}$}, \operatorname{cis}{$\frac{4\pi}{3}$} Both of which are third roots of unity. We want to now check if this value of $x^3$ satisfies $x^{1011}=\frac{-1\pm i\sqrt{3}}{2}.$ Notice that $x^{1011}$ = ($x^{3})^{112\cdot3}\cdotx^3,$ and since both values of $x^3$ are roots of unity, we can simplify the expression we want satisfied to the expression to $x^{1011}$=x^3. Since both values of $x^3$ are also values of $x^{1011}$, the roots for our $x^6+x^3+1$ are also roots of $x^{2022}+x^{1011}+1$, meaning that $x^6+x^3+$1 | $x^{2022}+x^{1011}+1$ so Therefore, the answer is $\boxed{E}.$

- DavidHovey
## Solution 4 (Describe the Roots)
We know that a monic polynomial q divides a monic polynomial p if and only if all the roots of q are roots of p. Since P(x)=$x^{2022}+x^{1011}+1=\frac{x^{3033}-1}{x^{1011}-1},$ the roots of P are the 3033rd roots of unity that aren't 1011th roots of unity.

Now, note that:

1: The roots of polynomial A are the primitive 6th roots of unity.

2: The roots of polynomial B are the primitive cube roots of unity.

3: The roots of polynomial C are the primitive 8th roots of unity.

4: The roots of polynomial D are the primitive 18th roots of unity.

5: The roots of polynomial E are the primitive 9th roots of unity.

However, since 6, 8, and 18 don't divide 3033, the roots of polynomial A are not all 3033rd roots of unity, and the same is true for polynomials C and D, eliminating choices A, C and D. Also, since 3 divides 1011, the roots of polynomial B are all 1011th roots of unity, eliminating choice B. That leaves choice $\boxed{E},$ and we can confirm that this is correct by noticing that 9 divides 3033 but not 1011. From that, we can see that the roots of polynomial E are 3033rd roots of unity but not 1011th roots of unity, so they are all roots of P. Therefore, E divides P.

*~pianoboy*
## Solution 5 (Simple Elimination)
Put the value x = -1. This gives P(-1) = (-$1)^{2022}$ + (-$1)^{1011} + 1 = 1$.
This automatically eliminates choices A , C and D since they do not form a factor of 1 at x = -1.

Solution 5.1:
Now, put x = $\omega (o$mega) at choice B. We get that,
$$\omega^2 + \omega + 1 = 0$$
Thus choice B has (x - $\omega)$ as a factor. If choice B were to be a factor of P(x), (x - $\omega)$ would also have to be a factor of P(x), which is clearly not the case, as P($\omega) \neq 0.$
This eliminates choice B, leaving us with answer $\boxed{E}.$

Solution $5.2(Mods)$:
Plug in 2 for x at choice $B. 2^2+2*2+1=7$.
The cycle of mods for 2 and 7 is 2, 4, 1. Both 2022 and 1011 are divisible by 3, so we have $1 + 1 + 1 = 3$. 3 is not divisible by 7, so we eliminate choice B. This leaves us with $\boxed{(E) x^{6}+x^{3}+1}.$

*~SouradipClash_03*

Solution 5.2 ~ Bread 10
### Solution 5a (Elimination but slightly different)
Like Solution 5, let x=-1 which eliminates the choices of A, C, and D as they do not divide P(-1)=1 as they form 3, 2, 3 respectively by letting x=-1.

This leaves us with only 2 choices, B and E. Notice that letting $x=0$ or $x=1$ still make these answer choices work and the other values will leave large numbers for us to check which is not feasible in a 75 minutes math competition.

However, we notice answer choice B is quadratic so if answer choice B divides the given polynomial, then the roots of the quadratic must also be roots of the polynomial.

Through quadratic formula, we find the roots of this quadratic as $\dfrac{-1+i\sqrt{3}}{2}$ and $\dfrac{-1-i\sqrt{3}}{2}.$

We notice that these roots can be written nicely in polar form $\cos(\dfrac{2\pi}{3})+i\sin(\dfrac{2\pi}{3})$ or $\cos(\dfrac{4\pi}{3})+i\sin(\dfrac{4\pi}{3}).$

We plug either one of these (preferably the root on the left as it is smaller) and see that the polynomial doesn't equal 0 suggesting that B is not the correct answer choice.

As we only have one answer choice left, we choose $\boxed{E}$

*~Batmanstark*
### Solution 5b (elimination but even faster and cheesier)
We first substitute 1 and -1 and eliminate A, C, and D. We are now left with B and E. When $x=3$, B=13; we then calculate $3^{2022}+3^{1011}+1$ mod 13. Note that 2022 and 1011 are both multiples of 3, and $3^3=27\equiv1\pmod{13}.$ Thus, $3^{2022}\equiv3^{1011}\equiv3^3\equiv1\pmod{13},$ so it turns out that the given expression is $1+1+1=3$ mod 13. We need it to be 0, and since $3\neq0,$ then B is not the correct answer; $\boxed{\textbf{(E) }x^6+x^3+1}$ is correct.

*~Technodoggo*
## Video Solution by Math-X (Smart and Simple)
https://youtu.be/7yAh4MtJ8a8?si=OkLQzwiqd9AnIS5K&t=6374 ~Math-X
## Video Solution
includes review of factoring polynomials

https://youtu.be/UIxePPu0Zus

*~MathProblemSolvingSkills.com*
## Video Solution by ThePuzzlr
https://youtu.be/YRcaIrwA2AU

*~MathIsChess*
## See Also
