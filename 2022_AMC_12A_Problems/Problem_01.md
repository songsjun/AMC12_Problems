# 2022 AMC 12A Problem 1

> This problem is the same as [2022 AMC 10A #1](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10A_Problems/Problem_1) and [2022 AMC 12A #1](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12A_Problems/Problem_1).
## Problem
What is the value of

$$3+\frac{1}{3+\frac{1}{3+\frac13}}?$$


$\textbf{(A)}\ \frac{31}{10}\qquad\textbf{(B)}\ \frac{49}{15}\qquad\textbf{(C)}\ \frac{33}{10}\qquad\textbf{(D)}\ \frac{109}{33}\qquad\textbf{(E)}\ \frac{15}{4}$
## Solution 1
We have


$$\begin{align*}

$$
3+\frac{1}{3+\frac{1}{3+\frac13}} &= 3+\frac{1}{3+\frac{1}{\left(\frac{10}{3}\right)}} \\
&= 3+\frac{1}{3+\frac{3}{10}} \\
&= 3+\frac{1}{\left(\frac{33}{10}\right)} \\
&= 3+\frac{10}{33} \\
&= \boxed{\textbf{(D)}\ \frac{109}{33}}.
$$

$\end{align*}$$$


*~MRENTHUSIASM*
## Solution 2
Continued fractions with integer parts $q_i$ and numerators all $1$ can be calculated as


$$\begin{align*}
$$\dfrac{[q_0,q_1,q_2,\ldots,q_n]}{[q_1,q_2,\ldots,q_n]}$$
$\end{align*}$$$


where


$$\begin{align*}
[]&=1 \\
$$[q_0,q_1,q_2,\ldots,q_n]&=q_0[q_1,q_2,\ldots,q_n]+[q_2,\ldots,q_n]\\$$
$\end{align*}$$$


$$\begin{align*}
[3]&=$3(1) = 3$\\
[3,3]&=$3(3)+1=10$\\
[3,3,3]&=$3(10)+3=33$\\
[3,3,3,3]&=$3(33)+10=109$\\

$$
\dfrac{[q_0,q_1,q_2,\ldots,q_n]}{[q_1,q_2,\ldots,q_n]}&=\dfrac{[3,3,3,3]}{[3,3,3]}\\
&=\boxed{\textbf{(D)}\ \frac{109}{33}}
$$

$\end{align*}$$$


*~lopkiloinm*
## Solution 3
Finite continued fractions of form $n+\frac{1}{n+\frac{1}{n+\cdots}}=\frac{x}{y}$ have linear combinations of $x, y$ that solve Pell's Equation. Specifically, the denominator $y$ and numerator $x$ are solutions to the Diophantine equation $(n^2+4)\left(\frac{y}{2}\right)^2-\left(x-\frac{ny}{2}\right)^2=\pm{1}$. So for this problem in particular, the denominator $y$ and numerator $x$ are solutions to the Diophantine equation $\left(\frac{y}{2}\right)^2-\left(x-\frac{3y}{2}\right)^2=\pm{1}$. That leaves two answers. Since the number of $1$'s in the continued fraction is odd, we further narrow it down to $\left(\frac{y}{2}\right)^2-\left(x-\frac{3y}{2}\right)^2=-1$, which only leaves us with $1$ answer and that is $(x,y)=(109,33)$ which means $\boxed{\textbf{(D)}\ \frac{109}{33}}$.

*~lopkiloinm*

(Note: Integer solutions increase exponentially, so our next solution will have a numerator greater than $3^2(109)$. Therefore, when you don't see numerators greater than $3^2(109)$ in the answer choices, this method should be fine.)
## Video Solution 1
https://youtu.be/iVvBTapX3Fs

*~Education, the Study of Everything*
## Video Solution 2
https://youtu.be/4zoXEjrBAgk

*~Charles3829*
## Video Solution 3
https://www.youtube.com/watch?v=7yAh4MtJ8a8&t=222s

*~Math-X*
## Video Solution 4
https://youtu.be/0b8OGBp1Ew0
## Video Solution 5
https://www.youtube.com/watch?v=PgJcNkO8Fh8

*~Math4All999*
## See Also
