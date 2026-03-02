# 2021 AMC 12B Problem 18

## Problem
Let z be a complex number satisfying 12|z|$^2=$2|$z+2$|^2+|z^2+1|^2+31. What is the value of $z+\frac 6$z?

$\textbf{(A) }-2 \qquad \textbf{(B) }-1 \qquad \textbf{(C) }\frac12\qquad \textbf{(D) }1 \qquad \textbf{(E) }4$
## Solution 1
Using the fact $z\bar{z}=$|z|^$2,$ the equation rewrites itself as

$$
\begin{align*} 12z\bar{z}&=2(z+2)(\bar{z}+2)+(z^2+1)(\bar{z}^2+1)+31 \\ -12z\bar{z}+2z\bar{z}+4(z+\bar{z})+8+z^2\bar{z}^2+(z^2+\bar{z}^2)+32&=0 \\ \left((z^2+2z\bar{z}+\bar{z}^2)+4(z+\bar{z})+4\right)+\left(z^2\bar{z}^2-12z\bar{z}+36\right)&=0 \\ (z+\bar{z}+2)^2+(z\bar{z}-6)^2&=0. \end{align*}
$$

As the two quantities in the parentheses are real, both quantities must equal 0 so $z+\frac6z=z+\bar{z}=\boxed{\textbf{(A) }-2}.$
## Solution 2
Let z = a + bi, z^2 = a^2-b^2+2abi

By the equation given in the problem

$$12(a^2+b^2) = 2((a+2)^2 + b^2) + ((a^2-b^2+1)^2 + (2ab)^2) + 31$$


$$12a^2 + 12b^2 = 2a^2 + 8a + 8 + 2b^2 + a^4 + b^4 + 1 + 2a^2 - 2b^2 - 2a^2b^2 + 4a^2b^2 + 31$$


$$a^4 + b^4 - 8a^2 - 12b^2 + 2a^2b^2 + 8a + 40 = 0$$

$$(a^2+b^2)^2 - 12(a^2+b^2) + 4(a^2 + 2a + 1) + 36=0$$

$$(a^2 + b^2 - 6)^2 + 4(a+1)^2 = 0$$

Therefore, a^2 + $b^2 - 6 = 0$ and $a+1 = 0$

$$a = -1, b^2 = 6-1 = 5, b = \sqrt{5}$$

z + $\frac{6}{z} = \frac{ a^2 - b^2 + 6 + 2abi }{ a+bi } = \frac{ 1 - 5 + 6 + 2(-1)\sqrt{5} i }{ -1 + i \sqrt{5} } = \frac{ 2 - 2i \sqrt{5} }{-1 + i \sqrt{5}} = \boxed{\textbf{(A)} -2}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 3
Let x = z + $\frac{6}{z}.$ Then $z =\frac{x \pm \sqrt{x^2-24}}{2}.$ From the answer choices， we know that x is real and $x^2<24$, so $z =\frac{x \pm i\sqrt{24-x^2}}{2}.$ Then we have

$$
|z|^2 = 6
|z+2|^2 = (\frac{x}{2} + 2)^2 + \frac{24-x^2}{4} = 2x+10
|z^2+1|^2 = |xz -6 +1|^2 = \left(\frac{x^2}{2}-5\right)^2 + \frac{x^2(24-x^2)}{4} = x^2 +25
$$

Plugging the above back to the original equation, we have

$$
12*6 = 2(2x+10) + x^2 + 25 + 31
(x+2)^2 = 0
So x = \boxed{\textbf{(A) }-2}.
$$


*~Sequoia*
## Solution 4 (Funny Observations)
There are actually several ways to see that |z|$^2 = 6. I$ present two troll ways of seeing it, and a legitimate way of checking.

Rewrite using w $\overline{w} =$ |w|^2$$


$$
12z \overline{z} + 2(z+2)(\overline{z} + 2) + (z^2+1)(\overline{z}^2+1)+31
12 z \overline{z} = 2z \overline{z} + 4z + 4 \overline{z} + 8 + z^2 \overline{z}^2+z^2+\overline{z}^2 + 1 + 31.
12 z \overline{z} = 4(z + \overline{z}) + (z \overline{z})^2 + (z + \overline{z})^2 + 40.
$$


Symmetric in z and $\overline{z},$ so if w is a sol, then so is $\overline{w}$

TROLL OBSERVATION #1: ALL THE ANSWERS ARE REAL. THUS, z + $\frac{6}{z} \in \mathbb{R},$ which means they must be conjugates and so |z|^$2 = 6.$

TROLL OBSERVATION #2: Note that $z+\frac{6}{z} = \overline{z} + \frac{6}{\overline{z}}$ because either solution must give the same answer! which means that |z|^$2 = 6.$

Alternatively, you can check:
Let a = w + $\overline{w} \in \mathbb{R},$ and r = |w|^2$\in \mathbb{R}.$ Thus, we have $a^2+4a+40+r^2-12r=0$, and the discriminant of this must be nonnegative as a is real. Thus, 16-$4(40+r^2-12r)\geq 0$ or ($r-6)^2 \leq 0,$ which forces $r = 6$, as claimed.

Thus, we plug in z $\overline{z} = 6,$ and get: $72 =4(z + $\overline{z}) + $76 + (z + \overline{z})^2,$ ie. ($z+\overline{z})^2 + 4(z + \overline{z}) + 4 = 0,$ or ($z+\overline{z} + 2)^2 = 0,$ which means z + $\overline{z} = \boxed{\textbf{(A) }-2}$ and that's our answer since we know $\overline{z} = 6$/ z

- ccx09
## Solution 5
Observe that all the answer choices are real. Therefore, z and $\frac{6}{z}$ must be complex conjugates as this is the only way for both their sum (one of the answer choices) and their product (6) to be real. Thus |z|=|$\tfrac{6}{z}$|=$\sqrt{6}.$ We will test all the answer choices, starting with $\textbf{(A)}.$ Suppose the answer is $\textbf{(A)}.$ If $z+\tfrac{6}{z}=-2$ then $z^{2}+2z+6=0$ and $z=\frac{-2\pm\sqrt{4-24}}{2}=-1\pm\sqrt{5}$i. Note that if $z=-1+\sqrt{5}$i works, then so does $-1-\sqrt{5}$i. It is relatively easy to see that if $z=-1+\sqrt{5}$i, then 12|z|^{2}$=12\cdot 6=72, $2|$z+$2|^{2}=2|$1+\sqrt{5}$i|=$2\cdot 6=12,$ |$z^{2}+$1|^{2}=|-3-$2\sqrt{5}$i|^{2}=$29,$ and 72=12+29+31. Thus the condition 12|z|^{2}$=$2|$z+$2|^{2}+|$z^{2}+$1|^{2}+31$$ is satisfied for $z+\tfrac{6}{z}=-2,$ and the answer is $\boxed{\textbf{(A) }-2}.$
## Solution 6
Using $z\bar{z}=$|z|^$2,$ we have

$$
\begin{align*}
12z\bar{z} = 2(z + 2)(\bar{z} + 2) + (z^2 + 1)(\bar{z}^2 + 1) + 31 &\implies z^2\bar{z}^2 + z^2 + \bar{z}^2 + 1 + 2z\bar{z} + 4z + 4\bar{z} + 8 + 31 - 12z\bar{z} = 0 \\
&\implies  z^2\bar{z}^2 - 10z\bar{z} + (z^2 + \bar{z}^2) + 4(z + \bar{z}) + 40 = 0
\end{align*}
$$

Let p = $z\bar{z}$ and s = z + $\bar{z}.$ Then we get

$$
\begin{align*}
p^2 - 10p + s^2 - 2p + 4s + 40 = 0 \implies p^2 - 12p + s^2 + 4s + 40 = 0
\end{align*}
$$

Completing the square, we get
$$(p-6)^2 - 36 + (s+2)^2 - 4 + 40 = (p-6)^2 + (s+2)^2 = 0$$
Therefore, $p = 6$ and s = -2. So, z + $\bar{z} = -2$ and $z\bar{z} = 6.$ Plugging into z + $\frac{6}{z},$ we get

$$z + \frac{6}{z} = z + \frac{6\bar{z}}{z\bar{z}} = z + \frac{6\bar{z}}{6} = z + \bar{z} = \boxed{\textbf{(A) }-2}$$


~[https://artofproblemsolving.com/wiki/index.php/User:Crazyvideogamez CrazyVideoGamez]
## Video Solution by OmegaLearn (Using Complex Number Identities)
https://youtu.be/AEbMTTGEZV4
*~pi_is_3.14*
## Video Solution
https://youtu.be/Yw-IJvfrT_U
*~MathProblemSolvingSkills.com*

(includes review of complex numbers)
## Video Solution by Punxsutawney Phil
https://youtu.be/E0HkYqZzw3s
## See Also
