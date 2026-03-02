# 2022 AMC 12B Problem 20

> This problem is the same as [2022 AMC 10B #21](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10B_Problems/Problem_21) and [2022 AMC 12B #20](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_20).
## Problem
Let $P(x)$ be a polynomial with rational coefficients such that when $P(x)$ is divided by the polynomial
$x^2 + x + 1$, the remainder is $x+2$, and when $P(x)$ is divided by the polynomial $x^2+1$, the remainder
is $2x+1$. There is a unique polynomial of least degree with these two properties. What is the sum of
the squares of the coefficients of that polynomial?

$\textbf{(A)}\ 10 \qquad\textbf{(B)}\ 13 \qquad\textbf{(C)}\ 19 \qquad\textbf{(D)}\ 20 \qquad\textbf{(E)}\ 23$
## Solution 1 (Experimentation)
Given that all the answer choices and coefficients are integers, we hope that $P(x)$ has positive integer coefficients.

Throughout this solution, we will express all polynomials in base $x$. E.g. $x^2 + x + 1 = 111_{x}$.

We are given:


$$111a + 12 = 101b + 21 = P(x).$$


We add $111$ and $101$ to each side and balance respectively:


$$111(a - 1) + 123 = 101(b - 1) + 122 = P(x).$$


We make the unit's digits equal:


$$111(a - 1) + 123 = 101(b - 2) + 223 = P(x).$$


We now notice that:


$$111(a - 11) + 1233 = 101(b - 12) + 1233 = P(x).$$


Therefore $a = 11_{x} = x + 1, b = 12_{x} = x + 2$, and $P(x) = 1233_{x} = x^3 + 2x^2 + 3x + 3. 3$ is the minimal degree of $P(x)$ since there is no way to influence the $x$‘s digit in $101b + 21$ when $b$ is an integer. The desired sum is $1^2 + 2^2 +3^2+ 3^2 = \boxed{\textbf{(E)} \ 23}$

P.S. The four computational steps can be deduced through quick experimentation.

*~numerophile*
## Solution 2
Let $P(x) = Q(x)(x^2+x+1) + x + 2$, then $P(x) = Q(x)(x^2+1) + xQ(x) + x + 2$, therefore $xQ(x) + x + 2 \equiv 2x + 1 \pmod{x^2+1}$, or $xQ(x) \equiv x-1 \pmod{x^2+1}$. The rule says we can change any $x^2$ into $-1$. This is because $x^2 \equiv -1 \pmod{x^2+1}$ (since $x^2 - (-1) = x^2+1$, which is a multiple of $x^2+1$).
To find the least possible degree $Q(x)$, it would be logical to first assume it's a constant. Let's say $Q(x)=c$, which makes $xQ(x) = cx$. Is $cx$ congruent to $x-1$? The difference is $cx - (x-1) = (c-1)x+1$. This is a polynomial of degree 1, so it's not a multiple of $x^2+1$ (a degree 2 polynomial). So, a constant won't work.
Could $Q(x)$ be a simple degree 1 polynomial? Let's try $Q(x) = x+1$. Let's check if $Q(x) = x+1$ works. Calculate $xQ(x)$: $x(x+1) = x^2+x$.

Now, apply our rule: we can replace $x^2$ with $-1$. Therefore, $x^2+x$ becomes $-1+x$, which is $x-1$. This shows that $xQ(x)$ is congruent to $x-1$.
Since we showed that no constant polynomial works, and we found a degree 1 polynomial that does work, the minimum degree must be 1. The simplest polynomial of degree 1 that satisfies the condition is $Q(x)=x+1$, and expanding gives $P(x) = x^3+2x^2+3x+3$. Summing the squares of coefficients gives $\boxed{\textbf{(E)} \ 23}$

*~mathfan2020*

*~Lovemath2021*
## Solution 3
Let $P(x) = (x^2+x+1)Q_1(x) + x + 2$,
then $P(x) = (x^2+1)Q_1(x) + xQ_1(x) + x + 2$

Also, $P(x) = (x^2+1)Q_2(x) + 2x + 1$

We infer that $Q_1(x)$ and $Q_2(x)$ have same degree, we can assume $Q_1(x) = x + a$, and $Q_2(x) = x + b$, since $P(x)$ has least degree. If this cannot work, we will try quadratic, etc.

Then we get:
$(x^2+1)(Q_1(x) - Q_2(x)) + xQ_1(x) - x + 1 = 0$

The constant term gives us:
$(Q_1(x) - Q_2(x)) + 1 = 0$

So $Q_1(x) - Q_2(x) = -1$

Substituting this in gives:
$-(x^2+1) + xQ_1(x) - x + 1 = 0$

Solving this equation, we get
$Q_1(x) = x + 1$

Plugging this into our original equation we get
$P(x) = x^3 + 2x^2 + 3x + 3$

Verify this works with $P(x) = (x^2+1)Q_2(x) + 2x + 1$

Therefore the answer is $1^2 + 2^2 + 3^2 + 3^2 = \boxed{\textbf{(E)} \ 23}$

*~qgcui*
## Solution 4 (Undetermined Coefficients)
Notice that we cannot have the quotients equal to some constants, since the same constant will yield different constant terms for $P(x)$ (which is bad) and different constants will yield different first coefficients (also bad). Thus, we try setting the quotients equal to linear terms (for minimizing degree).

Let $P(x)=(x^2+x+1)(ax+b)+(x+2)$ and $P(x)=(x^2+1)(ax+c)+(2x+1)$. The quotients have the same $x$ coefficient, since $P(x)$ must have the same $x^3$ coefficient in both cases. Expanding, we get

$$P(x)=ax^3+(a+b)x^2+(a+b+1)x+(b+2)$$

 and

$$P(x)=ax^3+cx^2+(a+2)x+(c+1).$$


Equating coefficients, we get $b+2=c+1, a+b+1=a+2$, and $a+b=c$. From the second equation, we get $b=1$, then substituting into         the first, $c=2$. Finally, from $a+b=c$, we have $a=1. Now, P(x)=(x^2+x+1)(ax+b)+(x+2)=(x^2+x+1)(x+1)+(x+2)=x^3+2x^2+3x+3$ and our answer is

$$1^2+2^2+3^2+3^2=\boxed{\textbf{(E)} \ 23}.$$


*~MathHayden*
## Solution 5 (Quick, but Not Quicker Than Solution 2)
We construct the following equations in terms of $P(x)$ and the information given by the problem:


$$\textbf{(1) } P(x)=(x^2+x+1)\cdot Q(x)+x+2$$


$$\textbf{(2) } P(x)=(x^2+1)\cdot R(x)+2x+1$$


Upon inspection, $Q(x)$ and $R(x)$ cannot be constant, so the smallest possible degree of $P(x)$ is $3,$ and both $Q(x)$ and $R(x)$ are linear.

Let $Q(x)=x-q$ and $R(x)=x-r.$ We know there will be values for $q$ and $r$ that make the below equation hold, so we can assume that $P(x)$ has a leading coefficient of $1$.

Substituting these values in, and setting $\textbf{(1)}$ and $\textbf{(2)}$ equal to each  other,


$$(x^2+x+1)(x-q)+x+2=(x^2+1)(x-r)+2x+1.$$


We plug in $x=0$, yielding $r+1=q.$ Substituting this value into the above equation,


$$(x^2+x+1)(x-r-1)+x+2=(x^2+1)(x-r)+2x+1.$$


Letting $x=1,$ we conclude that $r=-2,$ so $R(x)=x+2.$
Therefore,


$$P(x)=(x^2+1)(x+2)+2x+1 = x^3+2x^3+3x+3.$$


The requested sum is


$$1^2+2^2+3^2+3^2=\boxed{\textbf{(E) }23}$$


*~Benedict T (countmath1)*
## Solution 6 (Similar to Solution 3)
By remainder theorem, the polynomial can be written as follows.


$$P(x) = (x^2+x+1)Q_{1}(x)+x+2 = (x^2+1)Q_{2}(x)+2x+1$$


This is a timed exam, we can use the information given by answer choices. The answer choices tell us this is the polynomial with integer coefficients, and we need to find the polynomial with the least degree so we can assume both $Q_{1}(x)$ and $Q_{2}(x)$ are linear (the coefficient of x should be same).

Then we can write $P(x)$ as a cubic polynomial.


$$P(x) = (x^2+x+1)(ax+b)+x+2 = (x^2+1)(ax+c)+2x+1$$


Substituting $x=0,1,-1$ to determine the value of $a$ and $b$.

We have:


$$P(0) = b+2 = c+1$$


$$P(1) = 3a+3b+3 = 2a+2c+3$$


$$P(-1) = -a+b+1 = -2a+2c-1$$


We can solve the simultaneous equations: $a=1,b=1,c=2$

Hence, $P(x)=(x^2+x+1)(x+1)+x+2=x^3+2x^2+3x+3$. The answer is $\boxed{\textbf{(E) }23}$

*~PythZhou*
## Solution 7 (Bounding with Answer Choices)
We are given:

$P(x) \equiv x + 2 \pmod{x^2+x+1}$

$P(x) \equiv 2x + 1 \pmod{x^2+1}$

Since the problem asks us about the coefficients of the polynomial, we should evaluate $P(x)$ at $1$.

Our congruences now become:

$P(1) \equiv 1 + 2 \pmod{(1)^2+(1)+1}\implies P(1) \equiv 3 \pmod{3} \implies P(1) \equiv 0 \pmod{3}$.

$P(1) \equiv 2(1) + 1 \pmod{(1)^2+1}\implies P(1) \equiv 3 \pmod{2} \implies P(1) \equiv 1 \pmod{2}$.

We now know that the coefficients of the polynomial sum to an odd multiple of 3.

We now begin bounding the value of the sum of the coefficients squared. For our answer, the sum of the coefficients squared must be between $10$ and $23$. Trying a quadratic polynomial, if $P(1) = 3$, then the maximum of the coefficients squared is $9$ ($3^2+0^2+0^2$ is the maximum, any other permutation can be trivially shown to be lower). If $P(1) = 9$, the minimum of the coefficients squared is $2$7 ($3^2+3^2+3^2$, once again, any other permutation can be trivially shown to be higher). Any higher value of $P(1)$ obviously will not work, so $P(x)$ cannot be a quadratic.

Since a quadratic did not work, we now move up to a cubic. We start with $P(1) = 3$. Similarly to the quadratic, there is no way to get an answer within the range of the answer choices.

However, moving up to $P(1) = 9$, we get that the minimum of the coefficients squared is $81/4$ (which we get from all 4 coefficients being equal at $9/4$). Since this is the minimum, any other answers will be higher. We get that $\boxed{\textbf{(E) }23}$ is our answer, since it is the only answer choice greater than $81/4$.

*~SwordOfJustice*
## Solution 8
Since the divisors $x^2 + x + 1$ and $x^2 + 1$ are both powers of 2, and the remainders $x + 2$ and $2x + 1$ are both linear, we can assume that $P(x)$ has a minimum degree of 3.

We can then set the coefficients of the polynomial as $P(x) = ax^3 + bx^2 + cx + d$.

Then, using long division, we divide  $P(x) = ax^3 + bx^2 + cx + d$ by $x^2 + x + 1$ and obtain a remainder of $(c - b)x + (a + d - b)$, which is equal to $x + 2$

We also divide $P(x) = ax^3 + bx^2 + cx + d$ by $x^2 + 1$ and obtain a remainder of $(c - a)x + (d - b)$, which is equal to $2x + 1$.

From here we can set up a systems of equations:

$c -b = 1$

$a + d - b = 2$

$c - a = 2$

$d - b = 1$

Thus giving us the solutions $a = 1, b = 2, c = 3, d = 3$ and hence $P(x) = x^3 + 2x^2 + 3x + 3$

Squaring the coefficients, then adding them, $1^2 + 2^2 + 3^2 + 3^2$ we get the final answer $\boxed{\textbf{(E)} \ 23}$

*~Sedric S*
## Solution 9
We assume $P(x)$ is a monic cubic polynomial. Now, we set $P(x)=x^{3}+ax^{2}+bx+c$, and set the equations:

$x^{3}+ax^{2}+bx+c=Q_{1}(x)(x^{2}+x+1)+x+2$

$x^{3}+ax^{2}+bx+c=Q_{2}(x)(x^{2}+1)+2x+1$

Plugging in $x=i$ for the second equation, we get $-i-a+bi+c=2i+1$, and matching coefficients gives $c-a=1$ and $b-1=2 \rightarrow b=3$. Now, we can guess values for $a$ and $c$ based on the answer choices. We have that the sum of the squares of the current known coefficients is $1^{2}+3^{2}=10$, and guessing $c=1, a=0$ clearly doesnt match up with the answer choices, so we guess $c=3, a=2$ and find that the answer is $\boxed{\textbf{(E)} \ 23}$
## Solution 10 (EZ CRT)
If we let $x=10$, we just get a CRT problem. Note: this only works because all the coefficients are integers between 0 and 9. Our problem now is to find $n$ such that


$$n\equiv 12\pmod {111}$$


$$n\equiv 21\pmod {101}$$


After using some careful Euclidean Algorithm (or just eyeing it), $n=1233$, so our answer is $1^2+2^2+3^2+3^2 = \boxed{\textbf{(E)} \ 23}$.
## Video Solution (Interactive Teaching Approach)
https://www.youtube.com/watch?v=GxZta87dr8o

*~MathkidsbyMax*
## Video Solution
https://youtu.be/yGUur4vP_6k

*~ThePuzzlr*
## Video Solution
https://youtu.be/ELdhkqVyB9E

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by OmegaLearn Using Polynomial Remainders
https://youtu.be/HdrbPiZHim0

*~pi_is_3.14*
## Video Solution by The Power of Logic(#20-#21)
https://youtu.be/7FiTsDNMmgg
## Video Solution by Interstigation
https://youtu.be/TvOHfDJ_2Ag

*~Interstigation*
## Video Solution by TheBeautyofMath
https://youtu.be/UEQOPjlqh94

*~IceMatrix*
## See Also
