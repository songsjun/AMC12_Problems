# 2022 AMC 12A Problem 15

> This problem is the same as [2022 AMC 10A #16](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10A_Problems/Problem_16) and [2022 AMC 12A #15](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12A_Problems/Problem_15).
## Problem
The roots of the polynomial $10x^3 - 39x^2 + 29x - 6$ are the height, length, and width of a rectangular box (right rectangular prism). A new rectangular box is formed by lengthening each edge of the original box by $2$
units. What is the volume of the new box?

$\textbf{(A) } \frac{24}{5} \qquad \textbf{(B) } \frac{42}{5} \qquad \textbf{(C) } \frac{81}{5} \qquad \textbf{(D) } 30 \qquad \textbf{(E) } 48$
## Solution 1 (Vieta's Formulas)
Let $a$, $b$, $c$ be the three roots of the polynomial. The lengthened prism's volume is

$$V = (a+2)(b+2)(c+2) = abc+2ac+2ab+2bc+4a+4b+4c+8 = abc + 2(ab+ac+bc) + 4(a+b+c) + 8.$$


By Vieta's formulas, we know that a cubic polynomial $Ax^3+Bx^2+Cx+D$ with roots $a$, $b$, $c$ satisfies:


$$\begin{alignat*}{8}

$$
a+b+c &= -\frac{B}{A} &&= \frac{39}{10}, \\
ab+ac+bc &= \hspace{2mm}\frac{C}{A} &&= \frac{29}{10}, \\
$$

abc &= $-\frac{D}{A}$ &&= $\frac{6}{10}.$
$\end{alignat*}$$$


We can substitute these into the expression, obtaining

$$V = \frac{6}{10} + 2\left(\frac{29}{10}\right) + 4\left(\frac{39}{10}\right) + 8 = \boxed{\textbf{(D) } 30}.$$


- phuang1024
## Solution 2 (Guessing Roots)
From the answer choices, we can assume the roots are rational numbers, and therefore this polynomial should be easily factorable.
The coefficients of $x$ must multiply to $10$, so these coefficients must be $5,2,1$ or $10,1,$ in some order. We can try one at a time, and therefore write the factored form as follows:

$$(5x-p)(2x-q)(x-r).$$


Note that $p, q, r$ have to multiply to $6$, so they must be either $3,2,1$ or $6,1,1$ in some order. Again, we can try one at a time in different positions and see if they multiply correctly.
We try $(5x-2)(2x-1)(x-3)$ and multiply the $x-$terms, and sure enough they add up to $29$. You can try to add up the $x^2$ terms and they add up to $-39$. Therefore the roots are $\frac{2}{5}$, $\frac{1}{2}$ and $3$. Now if you add $2$ to each root, you get the volume is $\frac{12}{5} \cdot \frac{5}{2} \cdot 5 = 6 \cdot 5 = 30 = \boxed{\textbf{(D) } 30}$.

*~KingRavi*
## Solution 3 (Rational Root Theorem Bash)
We can find the roots of the cubic using the Rational Root Theorem, which tells us that the rational roots of the cubic must be in the form $\frac{p}{q}$, where $p$ is a factor of the constant $(-6)$ and $q$ is a factor of the leading coefficient $(10)$. Therefore, $p$ is $\pm (1, 2, 3, 6)$ and q is $\pm (1, 2, 5, 10).$

Doing Synthetic Division, we find that $3$ is a root of the cubic:


$$\begin{array}{c|rrrr}&10&-39&29&-6\\3&&30&-27&6\\\hline\\&10&-9&2&0\\\end{array}.$$


Then, we have a quadratic $10x^2-9x+2.$ Using the Quadratic Formula, we can find the other two roots:


$$x=\frac{9 \pm \sqrt{(-9)^2-4(10)(2)}}{2 \cdot 10},$$


which simplifies to $x=\frac{1}{2}, \frac{2}{5}.$

To find the new volume, we add $2$ to each of the roots we found:


$$(3+2)\cdot\left(\frac{1}{2}+2\right)\cdot\left(\frac{2}{5}+2\right).$$


Simplifying, we find that the new volume is $\boxed{\textbf{(D) } 30}.$

*~MathWizard09*
## Solution 4
Let $P(x) = 10x^3 - 39x^2 + 29x - 6$, and let $a, b, c$ be the roots of $P(x)$. The roots of $P(x-2)$ are then $a + 2, b + 2, c + 2,$ so the product of the roots of $P(x-2)$ is the area of the desired rectangular prism.

$P(x-2)$ has leading coefficient $10$ and constant term $P(0-2) = P(-2) = 10(-2)^3 - 39(-2)^2 + 29(-2) - 6 = -300$.

Thus, by Vieta's Formulas, the product of the roots of $P(x-2)$ is $\frac{-(-300)}{10} = \boxed{\textbf{(D) } 30}$.

*~Orange_Quail_9*
## Solution 5
Let $P(x) = 10x^3 - 39x^2 + 29x - 6$. This can be factored m as $P(x) = 10(x-a)(x-b)(x-c)$, where $a$, $b$, and $c$ are the roots of $P(x)$. We want $V = (a+2)(b+2)(c+2)$.

"Luckily" $P(-2) = 10(-2-a)(-2-b)(-2-c) = -10V.  P(-2) = -300$, giving $V = \boxed{\textbf{(D) } 30}$.

*~Oxymoronic15*

(It's not just lucky. If $P(x)$ has roots $x \in \{r_i\}$, $Q(x) = P(x-2)$ has roots $y \in \{r_i+2\}$. By Vieta, the product $V$ of the roots is the negation of the constant term divided by the leading coefficient $10$ , which is $-Q(0) / 10$, which is $-P(0-2) / 10$. -oinava )
## Solution 6 (Desperate Final Effort - Estimation Guess)
By Vieta's, we can see that $ABC = \frac{6}{10}$.
Using this, we can see that if each side $ABC$ is the same length, the length is between $0.8$  ($0.512$) and $0.9$ ($0.729$). Adding $2$ to these numbers would give us three numbers that are close to $3$. Rounding up, we will just assume they are all three.
If we multiply all of them, it gives us $27$.
The closest answer choice is $\boxed{\textbf{(D) } 30},$ as all of the other choices are far from this number (the second closest answer choice being $11$ away).

~[orenbad](https://artofproblemsolving.com/wiki/index.php/OrenSH)


$(2+0.6^{1/3})^3 \approx 23$ is a lower bound for the answer (if the roots are more spread out then adding to a smaller root stretches the product more than adding 2 to a larger root shrinks the product), but a different $P(x)$ with the same product of roots could have roots that lead to a much larger answer (but not exactly 48, it turns out). Going by this bound alone, only answers A, B, and C can be eliminated, leaving a guess between D and E.

*~oinava*
## Solution 7 (Very Nice Vieta Solve)
If we let the roots of the cubic polynomial be $p,q,r$, then we can write what we want in terms of $p, q, r$. So, we have

$$(p+2)(q+2)(r+2) = pqr + 2pq + 2qr + 4q + 2pr + 4p + 4r + 8 = pqr + 2(pq + qr + pr) + 4(q + p + r) + 8.$$

 Now, we can just use Vieta's to finish up from here! We have $pqr = -(\dfrac{6}{10}) = \dfrac{3}{5}$. Now, we can find the sum of the pairwise roots which is just $pq + qr + pr = \dfrac{29}{10}$ and then multiply by $2$ which gives $\dfrac{29}{5}$. Looking good so far! Now, we need to find the sum of the roots which is just $p + q + r = \dfrac{39}{10}$ and then multiply by $4$ which gives $\dfrac{78}{5}$. Almost there! Now, we just add $8$ to that sum, and then sum it all up to get $\boxed{\textbf{(D) } 30}$

*~jb2015007*

Note: This is the same as Solution 1.
## Video Solution (Interactive Teaching Approach)
https://www.youtube.com/watch?v=Oc4aNpPlnkA

*~MathkidsbyMax*
## Video Solution 1
https://youtu.be/L0JxfaLH9Nk
## Video Solution (Quick and Simple)
https://youtu.be/kvNM_USBoyE

*~Education, the Study of Everything*
## Video Solution (Very nice Trick)
https://youtu.be/7yAh4MtJ8a8?si=URJLqRFDNbizEVbM&t=3280

*~Math-X*
## See also
