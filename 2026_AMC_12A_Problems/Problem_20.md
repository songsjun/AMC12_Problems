# 2026 AMC 12A Problem 20

> This problem is the same as [2026 AMC 10A #24](https://artofproblemsolving.com/wiki/index.php/2026_AMC_10A_Problems/Problem_24) and [2026 AMC 12A #20](https://artofproblemsolving.com/wiki/index.php/2026_AMC_12A_Problems/Problem_20).

## Problem
How many polynomials $f(x)$ of degree $3$ satisfying

$$
f\left( 3+\sqrt{5} \right) = f\left( 3 - \sqrt{5} \right)
$$

are there that have leading coefficient equal to $1$ and all of whose coefficients are integers between $-10$ and $10$, inclusive?

$\textbf{(A)}\   21  \qquad 	\textbf{(B)}\   42  \qquad 	\textbf{(C)}\   63  \qquad 	\textbf{(D)}\   84  \qquad 	\textbf{(E)}\   105$

## Solution 1
Let the polynomial be $f(x)=x^3+ax^2+bx+c$ as the leading coefficient is 1. Substituting yields


$$
\left(3-\sqrt{5}\right)^3+a\left(3-\sqrt{5}\right)^2+b\left(3-\sqrt{5}\right)+c= \left(3+\sqrt{5}\right)^3+a\left(3+\sqrt{5}\right)^2+b\left(3+\sqrt{5}\right)+c
$$


Expanding yields


$$
(27-27\sqrt{5}+45-5\sqrt{5})+a(9-6\sqrt{5}+5)+b(3-\sqrt{5})+c
$$




$$
=(27+27\sqrt{5}+45+5\sqrt{5})+a(9+6\sqrt{5}+5)+b(3+\sqrt{5})+c
$$


Mass cancelling yields


$$
32\sqrt{5}+6\sqrt{5}a+\sqrt{5}b=0\implies 6a+b=-32
$$


Notice that since $-10\le b\le 10$, we get


$$
-42= -32-10\le -32-b\le -32+10=-22
$$


Hence,


$$
-7\le a\le -\frac{11}{3}\implies -7\le a\le -4
$$


Substituting yields the valid solutions $(a,b)=(-4,-8),(-5,-2),(-6,4),(-7,10)$. Noting that $c$ cancels and can thus take on any of the $21$ integers from $-10$ to $10$, inclusive, our answer is $21\cdot 4=84$, or $\boxed{\textbf{(D)}}$.

~ [eevee9406](https://artofproblemsolving.com/wiki/index.php/User:Eevee9406)
~ Minor edit by Nioronean
~chrislakee 
~i_like_mashed_potatoes

## Solution 2
Let $f\left(3+\sqrt 5\right)=f\left(3-\sqrt 5\right)=c$. Now define a new function $g(x)\coloneqq f(x)-c$. Clearly $g$ is still a cubic, and the 2 of the roots of $g$ will be $r_1, r_2=3+\sqrt 5, 3-\sqrt 5$. Hence $g(x)=(x-d)(x-r_1)(x-r_2)+c$. We work backwards to get 


$$
x=3\pm\sqrt 5\implies x-3=\pm\sqrt 5\implies (x-3)^2=5\implies x^2-6x+9=5\implies x^2-6x+4=0.
$$

 So $g(x)=(x-d)(x^2-6x+4)+c$. 
Now we just need to apply our given condition. Expanding we have that $g(x)=x^3-(6+d)x^2+(4+6d)x-4d+c$. The most restrictive inequality would be applied to the coefficient of $x$, to yield 


$$
-10\le 4+6d\le 10\implies -14\le 6d\le 6\implies -\frac73\le d\le 1.
$$


So $d\in\{-2, -1, 0, 1\}$. We can choose $c$ freely as long as $|-4d+c|\le 10$, which gives 21 valid $c$ for each case. Hence there are $4\cdot 21=\boxed{84\hspace{1mm}\textbf{(D)}}$ such functions. 

Also note that $c$ can have 21 choices because it cancels out in the initial equality of $f\left(3+\sqrt 5\right)=f\left(3-\sqrt 5\right)$
~Amon26

Note: If you are stuck on which answer to choose, once you have gotten to the restrictions on $d$, you can clearly note that the answer has to be divisible by 4, in which $\textbf{(D)}$ is the only option.

~singularity1

## Solution 3
First let $x_1=3+\sqrt5$ and $x_2=3-\sqrt5.$ 

Next, let $f(x)=x^3+ax^2+bx+c$ since $f$ is monic. From the problem statement, 

$$
x_1^3+ax^2_1+bx_1+c=x_2^3+ax_2^2+bx_2+c.
$$



Clearly, the value of $c$ is irrelevent since subtracting $c$ from both sides retains the equation. So, there are $21$ choices. (A check is that the answer choices are multiples of $21$)

Now, substitute for $x_1$ and $x_2.$

$x_1^2=14+6\sqrt5$ and $x_2^2=14-6\sqrt5$ next
$x_1^3=72+32\sqrt5$ and $x_2^3=72-32\sqrt5$.

So, substituting one gets 

$$
(72+32\sqrt5)+a(14+6\sqrt5)+b(3+\sqrt5)=(72-32\sqrt5)+a(14-6\sqrt5)+b(3-\sqrt5).
$$



Cancelling terms and rearranging gives 



$$
\begin{align*}
64\sqrt5+12a\sqrt5+2b\sqrt5&=0 \Rightarrow \\
32+6a+b&=0.
\end{align*}
$$



Take the equation$\pmod 6$ yields $2+b\equiv 0 \pmod 6$ so $b \equiv 4 \pmod 6$ and $b=-8, -2, 4, 10.$

Substituting yields $a=-4, -5, -6, -7$ respectively. 

Thus, since there are only four pairs $(a, b)$ and $21$ choices of $c$ for each pair there are $4\cdot21=\boxed{84\hspace{1mm}\textbf{(D)}}$ total pairs.

Note this solution follows similar to solution $1$ but finishes with a quick modulo inspection.
Some motivation of using the form $x^3+ax^2+bx+c$ rather than a function like $(x-r_1)(x-r_2)(x-r_3)$ is because the problem references the coefficients.

~Soccerstar9
~$\LaTeX$ edits hothost59

## Solution 4 (Similar to Solution 2)
Let $f\left( 3+\sqrt{5}\right) = f\left( 3-\sqrt{5}\right) = c$ for some constant $c$. Consider the function $f(x)-c$. This function has roots at $3 \pm \sqrt{5}$ and is monic (leading coefficient $1$), so it is divisible by the monic quadratic which also has these two roots.

We rewrite $3 \pm \sqrt{5}$ as $\frac{6\pm \sqrt{20}}{2}$. By the quadratic formula, the coefficient of the linear term is $-6$ and the leading coefficient is $1$. We can then find that the constant is $4$. We can now set $f(x)-c=(x^2-6x+4)(x-k)$.

We expand the right hand side and rearrange to get $f(x)=x^3-(k+6)x^2+(6k+4)x-4k+c$. We bound the linear coefficient $6k+4$ between $[-10, 10]$ to get $k=-2, -1, 0, 1$. For any of these four values of $k$, there are $21$ values of $c$ such that the constant is in $[-10, 10]$. Furthermore, the quadratic coefficient is always in this range for all choices of $k$. 

To finish, we multiply the number of valid $k$ by the number of valid $c$ to get $4 \cdot 21= \boxed{\textbf{(D) } 84}$

~joiceeliu

### Note
You can also find the coefficients of the polynomial using Vietas Formulas. Because $f$ is monic, the leading coefficient of this quadratic is 1. The sum of the values is $6$, and the product of the values is $(3-\sqrt{5})(3+\sqrt{5})=3^2-(\sqrt{5})^2=9-5=4$. Thus by Vietas, resulting in the same polynomial, $x^2-6x+4$, but just a little bit quicker. 
~Voidling

## Solution 5 (Quick Calculus)
Let the polynomial be $f(x)=x^3+ax^2+bx+c$. First, note that if a cubic polynomial $f(x)$ has the same value at $a-b$ and $a+b$, then the derivative of the polynomial is always equal to $-b^2$. We can then take the derivative of the polynomial and make it equal to $-5$ at $x=3$.

Taking the derivative yields $f'(x)=3x^2+2ax+b=-5$. Plugging in $x=3$ gives $f'(3)=3(3)^2+2a(3)+b=-5$ and this gives the equation $27+6a+b=-5$, and therefore, $b=-6a-32$. Plugging this value into the given inequality yields:



$$
-10\le -6a-32\le 10\implies 22\le -6a\le 42\implies -7\le a\le -\frac{11}{3}
$$


Therefore, $a\in\{-7, -6, -5, -4\}$. Notice that these values of $a$ also satisfy the inequality. Then, we multiply the number of valid $a$ by the number of valid $c$ and this gives $4 \cdot 21= \boxed{\textbf{(D) } 84}$ total polynomials.

~mathperson0101

~staygene: Question: Where are we getting this: "First, note that if a cubic polynomial $f(x)$ has the same value at $a-b$ and $a+b$, then the derivative of the polynomial is always equal to $-b^2$. "? I can prove it but is there a specific name for it and what else it's used for? Just kind of niche lol

## Solution 6 (No Cubing Radicals)
Let $f(x) = x^3 + ax^2 + bx + c$, and let $p = 3 + \sqrt{5}$ and $q = 3 - \sqrt{5}$. Note that $p + q = 6$ and $pq = 9 - 5 = 4$.

Substituting $p$ and $q$ has the condition $f(p) = f(q)$ become


$$
p^3 + ap^2 + bp + c = q^3 + aq^2 + bq + c,
$$


so


$$
(p^3 - q^3) + a(p^2 - q^2) + b(p - q) = 0.
$$



Since $p \neq q$, we can divide by $p - q$ to get


$$
(p^2 + pq + q^2) + a(p + q) + b = 0.
$$



We have $p^2 + q^2 = (p + q)^2 - 2pq = 36 - 8 = 28$, so $p^2 + pq + q^2 = 28 + 4 = 32$. The equation becomes


$$
32 + 6a + b = 0, \quad\text{so}\quad b = -32 - 6a.
$$



We need $-10 \le b \le 10$, which means $-10 \le -32 - 6a \le 10$. This gives $-7 \le a \le -\tfrac{11}{3}$, so $a \in \{-7, -6, -5, -4\}$, with corresponding $b = 10, 4, -2, -8$, and note that each pair is unique.

Finally, since the constant $c$ cancels out, $c$ can be any of the $21$ integers from $-10$ to $10$. The number of polynomials is $4 \cdot 21 = \boxed{\textbf{(D)}~84}$.

~ Aeioujyot

### Note
If we solve for $a$ in terms of $b$ instead of solving for $b$ in terms of $a$ for the final inequality, we will get $-10 \le \frac{-32 - b}{6} \le 10$. Simplifying gives $-92 \le b \le 28$. This is entirely correct, however it is not useful in our situation given that $-10 \le b \le 10$. Aside from solving for $a$ in terms of $b$ being simpler, we also note that if we solve for $a$ in terms of $b$ and treat $a$ as $y$ and $b$ as $x$ in a graph, the slope will be $-\frac{1}{6}$. The boundaries the problem gives us are $-10 \le a \le 10$, so our slope that is close to $0$ will make the line travel for a long distance on the $b$ axis before reaching the other boundary, making it so that inequality will not provide much new information to us. If we do this quick check, we can realize that solving for $b$ in terms of $a$ is the correct thing to do.

~BOTNATE

### Another Note
Due to $a$ and $b$ being integers, once we found the values of $a$ that work it is guaranteed that each value of $a$ has a corresponding value of $b$ which is just $-32-6a$, which is what we solved for, and that is an integer. We also know that $-32-6a$ is between $-10$ and $10$ because by definition it is the same as $b$ which has the same restriction.

~BOTNATE

## Video Solution 1 by MadMath
https://youtu.be/KehvvZiBGm4

## Video Solution 2 by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ
