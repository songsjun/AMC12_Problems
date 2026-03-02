# 2024 AMC 12B Problem 18

> This problem is the same as [2024 AMC 10B #23](https://artofproblemsolving.com/wiki/index.php/2024_AMC_10B_Problems/Problem_24) and [2024 AMC 12B #18](https://artofproblemsolving.com/wiki/index.php/2024_AMC_12B_Problems/Problem_18).
## Problem
The Fibonacci numbers are defined by $F_1 = 1, F_2 = 1,$ and $F_n = F_{n-1} + F_{n-2}$ for $n \geq 3.$ What is

$${\frac{F_2}{F_1}} + {\frac{F_4}{F_2}} + {\frac{F_6}{F_3}} + ... + {\frac{F_{20}}{F_{10}}}?$$


$\textbf{(A) } 318 \qquad\textbf{(B) } 319 \qquad\textbf{(C) } 320 \qquad\textbf{(D) } 321 \qquad\textbf{(E) } 322$
## Solution 1 (Brute Force)
The first $20$ terms are $F_n = 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765$

So the answer is $1 +  3 + 4 + 7 + 11 + 18 + 29 + 47 + 76 + 123 =  \boxed{(B) 319}$.
*Do not do this unless you have no other option or no time to find a smarter way

~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Solution 2 (Pattern)
Plug in a few numbers to see if there is a pattern. List out a few Fibonacci numbers, and then try them on the equation. You'll find that ${\frac{F_2}{F_1}} = {\frac{1}{1}} = 1, {\frac{F_4}{F_2}} = {\frac{3}{1}} = 3, {\frac{F_6}{F_3}} = {\frac{8}{2}} = 4,$ and ${\frac{F_8}{F_4}} = {\frac{21}{3}} = 7.$ The pattern is that then ten fractions are in their own leapfrog sequence with the starting two terms being $1$ and $3$, which can be written as $G_1 = 1, G_2 = 3, G_n = G_{n-1} + G_{n-2}$ for $n \geq 3.$ The problem is asking for the sum of the ten terms $G_1 + G_2 + G_3 + ... + G_{10}$, and after adding up the first ten terms $1 + 3 + 4 + 7 + 11 + 18 + 29 + 47 + 76 + 123$, you arrive at the solution $\boxed{\textbf{(B) }319}.$

*~Cattycute*
## Note
The terms $1, 3, 4, 7 \cdots , 76, 123$ are actually part of a sequence called the Lucas Numbers.

*~NXC*
## Solution 3 (Characteristic Equation and Recurrence Relationship)
Using characteristic equation $x^2=x+1$ and starting terms $F_1 =1, F_2=1$, we get $F_n=\frac{1}{\sqrt{5}} (A^n- B^n)$, A= $\frac{1+\sqrt{5}}{2}$ , B = $\frac{1-\sqrt{5}}{2}$

Define a new sequence (this is actually a Lucas sequence)

$$L_n = \frac{F_{2n}}{F_{n}} = \frac{A^{2n} - B^{2n}}{A^{n} - B^{n}} =A^n+B^n$$


Given that $L_n$ has the same 2 roots (A,B) as the characteristic equation $x^2=x+1$ it implies that $L_{n}  =L_{n-1}  + L_{n-2}$. It can also be verified below.
Noticing $A^2 = A + 1$ and $B^2 = B + 1$,
Therefore,


$$L_n = A^n + B^n  =  A^2 \cdot A^{n-2} + B^2 \cdot B^{n-2}  =  (A +1) \cdot A^{n-2} + (B+1) \cdot B^{n-2} = (A^{n-1} + B^{n-1}) + (A^{n-2} + B^{n-2}) = L_{n-1} + L_{n-2} .$$


Calculating the first 10 terms using the recurrence relation $L_{n}  =L_{n-1}  + L_{n-2}$ and the initial values $L_1 = 1$ and $L_2 = 3$, we get:


$$L_1 = 1, \quad L_2 = 3, \quad L_3 = 4, \quad L_4 = 7, \quad L_5 = 11$$


$$\quad L_6 = 18, \quad L_7 = 29, \quad L_8 = 47, \quad L_9 = 76, \quad L_{10} = 123$$


So the answer is $1 + 3 + 4 + 7 + 11 + 18 + 29 + 47 + 76 + 123 = \boxed{\textbf{(B) }319}$.

~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Solution 3 (Generic Lucas Sequence Sum Formula)
$$S_k = \sum_{n=1}^{k} L_n = \sum_{n=1}^{k} (A^n + B^n) = \sum_{n=1}^{k} A^n + \sum_{n=1}^{k} B^n = \frac{A(1 - A^k)}{1 - A} + \frac{B(1 - B^k)}{1 - B}$$


Recall the sum formula for a geometric series:


$$\sum_{n=1}^{k} r^n = r + r^2 + \cdots + r^k = \frac{r(1 - r^k)}{1 - r}, \quad \text{for } r \neq 1$$



To simplify further, notice that:
$A = \frac{1 + \sqrt{5}}{2}$ and $B = \frac{1 - \sqrt{5}}{2}$ are roots of $x^2 = x + 1$, so:


$$1 - A = B \quad \text{and} \quad 1 - B = A.$$


$$S_k = \frac{A(1 - A^k)}{B} + \frac{B(1 - B^k)}{A} = \frac{A^{k+2} - A^2 + B^{k+2} - B^2}{A \cdot B}  =  \frac{A^{k+2}  + B^{k+2} -   (A^2+  B^2) }{A \cdot B}  = A^{k+2}  + B^{k+2} -3 = L_{n+2} - 3$$


This formula $S_k =  A^{k+2}  + B^{k+2} - 3$ gives us a direct way to calculate the sum of $L_n$ for any $k$.


$$L_{2n} = (A^n + B^n)^2 - 2 \cdot (AB)^n = L_{n} - 2 \cdot (-1) ^n$$


$$L_{2n+1} = (A^n + B^n)(A^{n+1} + B^{n+1}) -  (AB)^n(A+B) = L_{n}L_{n+1} - (-1)^n$$


$$L_{12} = (L_{6} )^2 -2 = (L_{3}^2 + 2 )^2 -2  = (4^2 + 2 )^2 - 2  = 324 - 2 = 322$$


Hence,

$$\sum_{n=1}^{10} = L_{12} -3 = 322 - 3 =  \boxed{(B) 319}$$


*Please do not do this on an actually exam in AMC 10 and only do it when you have no time in AMC 12


~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Solution 4
Remember that for any $n\ge0$,

$$\frac{F_{2n}}{F_{n}} = L_{n}$$


This can be found in 9.4.3 (b) of Inter Counting ( Serengeti 22)

so the answer is $1 + 3 + 4 + 7 + 11 + 18 + 29 + 47 + 76 + 123 = \boxed{(B) 319}$.

*~Apollo08 (first solution)*
## Solution 5 (Fibonacci Identities)
If you are well-versed in identities relating Fibonacci numbers (or spot this pattern by induction) then you may see that


$$F_{2n}=F_{n}(F_{n-1}+F_{n+1})$$


Then we can say that the sum required is just $(F_0+F_1+...+F_9)+(F_2+F_3+...+F_{11})$ (and we take $F_0=0$). There is not much we can do to aid our calculation, so we directly calculate the answer using the sequence $1$, $1$, 2, 3, 5, 8, 13, 21, 34, 55, $89$. You should get $\boxed{(B) 319}$.

(If you are interested, this identity can be proved using the inductive process as well as using the fact $F_{n}F_{n+1}-F_{n-2}F_{n-1}=F_{2n-1}$.)

*~lisztepos*
## Solution 6
This solution is motivated by solution 3.

The explicit formula for Fibonacci numbers is


$$F_n = \frac{1}{\sqrt{5}} \left( \frac{1 + \sqrt{5}}{2} \right)^n - \frac{1}{\sqrt{5}} \left( \frac{1 - \sqrt{5}}{2} \right)^n$$


Therefore,


$$F_{2n} = \frac{1}{\sqrt{5}} \left( \frac{1 + \sqrt{5}}{2} \right)^{2n} - \frac{1}{\sqrt{5}} \left( \frac{1 - \sqrt{5}}{2} \right)^{2n}$$


Using the explicit formulas, the equation for $\frac{F_{2n}}{F_n}$ could be computed.


$$\begin{align*}

$$
\frac{F_{2n}}{F_n}
&= \frac{\frac{1}{\sqrt{5}} \left( \frac{1 + \sqrt{5}}{2} \right)^n - \frac{1}{\sqrt{5}} \left( \frac{1 - \sqrt{5}}{2} \right)^n}{\frac{1}{\sqrt{5}} \left( \frac{1 + \sqrt{5}}{2} \right)^{2n} - \frac{1}{\sqrt{5}} \left( \frac{1 - \sqrt{5}}{2} \right)^{2n}} \\
&= \left( \frac{1 + \sqrt{5}}{2} \right)^n + \left( \frac{1 - \sqrt{5}}{2} \right)^n
$$

$\end{align*}$$$


The square roots in the numbers $\frac{1 + \sqrt{5}}{2}$ and $\frac{1 - \sqrt{5}}{2}$ could be removed by adding or multiplying the numbers. Therefore, let $\alpha = \frac{1 + \sqrt{5}}{2}$ and $\beta = \frac{1 - \sqrt{5}}{2}$.


Notice that $\alpha + \beta = 1$ and $\alpha\beta = -1$. In other words, $\alpha$ and $\beta$ are the roots of the equation $x^2 - x - 1 = 0$.


$$\begin{align*}

$$
\alpha^2 &= \alpha + 1 \\
\beta^2 &= \beta + 1 \\
\alpha^2 \alpha^n &= \alpha^{n + 1} + \alpha^n \\
\beta^2 \beta^n &= \beta^{n + 1} + \beta^n
$$

$\end{align*}$$$


Let $a_i = \alpha^i$ and $b_i = \beta^i$ for convenience. Notice that $a_{n + 2} + b_{n + 2} = a_{n + 1} + b_{n + 1} + a_n + b_n$. Let $f_n = a_n + b_n$. Observe that $f_{n + 2} = f_{n + 1} + f_n$.


$f_1 = 1$ and $f_2 = 3$ are known. Moreover, $f_n$ share the property of Fibonacci numbers. Note that every sequence $F_n$ that forms a new term by adding two previous terms have the following property.


$$\sum_{k=1}^{n} F_k = F_{n+2} - F_2 \qquad (n \geq 1)$$


Therefore,


$$\sum_{k=1}^{10} F_k = F_{12} - 3.$$


Moreover, $\{f_n\}_{n=1}^\infty \coloneq \{ 1, 3, 4, 7, 11, 18, 29, 47, 76, 123, 199, 322, \dots \}$.
Therefore, $322 - 3 = \boxed{\textbf{(B) }319}$.

*~MaPhyCom*
## Solution 7 (Lots of Identities)
Of course, olympiad algebra mains recall that for any $n\ge0$,

$$\frac{F_{2n}}{F_{n}} = L_{n}$$

 where $L_{n}$ denotes the Lucas numbers. A well known Fibonacci identity is that


$$\sum_{k=1}^{n} F_k = F_{n+2} - F_2 \qquad (n \geq 1)$$


Now we also know

$$L_{n} = F_{n-1}+F_{n+1}$$

 which further nukes the problem if you do not feel like calculating Lucas numbers. Either way, we should get an answer of $\boxed{\textbf{(B) }319}$.

Remark: All proofs of these identities are on Wikipedia.

*~gold duck*
## Video Solution 1 by Pi Academy (In Less Than 3 Mins ⚡🚀)
https://youtu.be/YjQ9Q93RCu4?feature=shared

*~Pi Academy*
## Video Solution 2 by Innovative Minds
https://www.youtube.com/watch?v=7KEk5VbxwAU
## Video Solution 3 by SpreadTheMathLove
https://youtu.be/ag4IC3e2Oqo?si=xhi4l1Jel40naI4g
## See also
