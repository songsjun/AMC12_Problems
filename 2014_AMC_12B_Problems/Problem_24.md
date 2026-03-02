# 2014 AMC 12B Problem 24

## Problem
Let ABCDE be a pentagon inscribed in a circle such that AB = CD = 3, BC = DE = 10, and AE= 14.  The sum of the lengths of all diagonals of ABCDE is equal to $\frac{m}{n},$ where m and n are relatively prime positive integers.  What is m+n ?

$\textbf{(A) }129\qquad \textbf{(B) }247\qquad \textbf{(C) }353\qquad \textbf{(D) }391\qquad \textbf{(E) }421\qquad$
## Solution 1
Let BE=a, AD=b, and AC=CE=BD=c. Let F be on AE such that CF \perp AE.

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200); defaultpen(linewidth(0.4)+fontsize(10)); pen s = linewidth(0.8)+fontsize(8); pair O,A,B,C,D,E0,F; O=origin; A= dir(198); path c = CR(O,1); real $r = 0.13535$; B = IP(c, CR(A,3*r)); C = IP(c, CR(B,10*r)); D = IP(c, CR(C,3*r)); E0 = OP(c, CR(D,10*r)); F = foot(C,A,E0); dot("$A$", A, A-O); dot("$B$", B, B-O); dot("$C$", C, C-O); dot("$D$", D, D-O); dot("$E$", E0, E0-O); dot("$F$", F, F-C); label("$c$",A--C,S); label("$c$",E0--C,W); label("$7$",F--E0,S); label("$7$",F--A,S); label("$3$",A--B,2*W); label("$10$",B--C,2*N); label("$3$",C--D,2*NE); label("$10$",D--E0,E); draw(A--B--C--D--E0--A, black+0.8); draw(CR(O,1), s); draw(A--C--E0, royalblue); draw(C--F, royalblue+dashed); draw(rightanglemark(E0,F,C,2)); MA("$\theta$",A,B,C,0.075); MA("$\pi-\theta$",C,E0,A,0.1);
```

In $\triangle CFE$ we have $\cos\theta = -\cos(\pi-\theta)=-7$/c. We use the [Law of Cosines](https://artofproblemsolving.com/wiki/index.php/Law_of_Cosines) on $\triangle ABC$ to get $60\cos\theta = 109-c^2.$  Eliminating $\cos\theta$ we get $c^3-109c-420=0$ which factorizes as
$(c+7)(c+5)(c-12)=0$.Discarding the negative roots we have $c=12$. Thus BD=AC=CE=12. For BE=a, we use Ptolemy's theorem on cyclic quadrilateral ABCE to get $a=44/3$. For AD=b, we use [Ptolemy's theorem](https://artofproblemsolving.com/wiki/index.php/Ptolemy's_theorem) on cyclic quadrilateral ACDE to get $b=27/2$.

The sum of the lengths of the diagonals is $12+12+12+\tfrac{44}{3}+\tfrac{27}{2} = \tfrac{385}{6}$ so the answer is 385 + 6 = \fbox{$\textbf{(D) }391$}
## Solution 2
Let a denote the length of a diagonal opposite adjacent sides of length 14 and 3, b for sides 14 and 10, and c for sides 3 and 10. Using Ptolemy's Theorem on the five possible quadrilaterals in the configuration, we obtain:


$$
\begin{align} c^2 &= 3a+100 \\ c^2 &= 10b+9 \\ ab &= 30+14c \\ ac &= 3c+140\\ bc &= 10c+42 \end{align}
$$


Using equations (1) and (2), we obtain:

$$a = \frac{c^2-100}{3}$$

and

$$b = \frac{c^2-9}{10}$$

Plugging into equation (4), we find that:


$$
\begin{align*} \frac{c^2-100}{3}c &= 3c + 140\\ \frac{c^3-100c}{3} &= 3c + 140\\ c^3-100c &= 9c + 420\\ c^3-109c-420 &=0\\ (c-12)(c+7)(c+5)&=0 \end{align*}
$$


Or similarly into equation (5) to check:


$$
\begin{align*} \frac{c^2-9}{10}c &= 10c+42\\ \frac{c^3-9c}{10} &= 10c + 42\\ c^3-9c &= 100c + 420\\ c^3-109c-420 &=0\\ (c-12)(c+7)(c+5)&=0 \end{align*}
$$


c, being a length, must be positive, implying that $c=12$. In fact, this is reasonable, since $10+3\approx 12$ in the pentagon with apparently obtuse angles. Plugging this back into equations (1) and (2) we find that $a =\frac{44}{3}$ and $b=\frac{135}{10}=\frac{27}{2}.$

We desire $3c+a+b =3\cdot 12 + \frac{44}{3} + \frac{27}{2} = \frac{216+88+81}{6}=\frac{385}{6},$ so it follows that the answer is 385 + 6 = \fbox{$\textbf{(D) }391$}
## Solution 3 (Ptolemy's but Quicker)
Let us set x to be AC=BD=CE and y to be BE and z to be AD. It follow from applying [Ptolemy's Theorem](https://artofproblemsolving.com/wiki/index.php/Ptolemy's_Theorem) on ABCD to get $x^2=9+10z$. Applying Ptolemy's on ACDE gives xz=42+$10x$; and applying Ptolemy's on BCDE gives $x^2=100+3y$. So, we have the have the following system of equations:


$$
\begin{align} x^2 &= 9+10z \\ x^2 &= 100+3y \\ xz &= 42+10x \end{align}
$$


From (3), we have 42=$(z-10)$x. Isolating the x gives $x=\dfrac{42}{z-10}.$ Plugging in $x=\dfrac{42}{z-10}$ to (1) gives


$$
\begin{align*} \left(\frac{42}{z-10}\right)^2 &= 10z+9\\ 10z^3 - 191z^2 + 820z + 900 &= 1764\\ 10z^3 - 191z^2 + 820z - 864 &= 0\\ (5z-8)(2z-27)(z-4) &=0 \end{align*}
$$


It is impossible for z<10 for x<0; that means $z=\frac{27}{2}.$ That means $x = 12$ and $y =\frac{44}{3}.$

Thus, the sum of all diagonals is $3x+y+z =3\cdot 12 + \frac{44}{3} + \frac{27}{2} = 385/6$, which implies our answer is m+$n = 385+$6 = \fbox{391 $\textbf{(D)}$}.

*~sml1809*
## Solution 4
[center|400px](https://artofproblemsolving.com/wiki/index.php/File:2014AMC12BProblem24Solution4.png)
Let BE = a, AC = CE = BD = b

By [Ptolemy's theorem](https://artofproblemsolving.com/wiki/index.php/Ptolemy's_theorem) for quadrilateral ABCE, AB $\cdot CE + BC \cdot AE = BE \cdot AC, $3b + 140 = ab, $a = 3+\frac{140}{b}$

By [Ptolemy's theorem](https://artofproblemsolving.com/wiki/index.php/Ptolemy's_theorem) for quadrilateral BCDE, CD $\cdot BE + BC \cdot DE = BD \cdot CE, 3a + 100 = b^2$


$$3(3 + \frac{140}{b}) + 100 = b^2, b^3 - 109 b -420 = 0, (b-12)(b+7)(b+5) = 0, b = 12$$


$$a = 3 + \frac{140}{12} = \frac{44}{3}$$

By [Ptolemy's theorem](https://artofproblemsolving.com/wiki/index.php/Ptolemy's_theorem) for quadrilateral ABDE, AE $\cdot BD + AB \cdot DE = AD \cdot BE, AD \cdota =14b + 30, AD = \frac{27}{2}$


$$\frac{m}{n} = 12 + 12 + 12 + \frac{44}{3} + \frac{27}{2} = \frac{385}{6}, 385 + 6 = \boxed{\textbf{(D) }391}$$


~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## See also
