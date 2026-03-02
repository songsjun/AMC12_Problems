# 2012 AMC 12A Problem 7

> This problem is the same as [2012 AMC 12A #7](https://artofproblemsolving.com/wiki/index.php/2012_AMC_12A_Problems) and [2012 AMC 10A #10](https://artofproblemsolving.com/wiki/index.php/2012_AMC_10A_Problems).
## Problem
Mary divides a circle into 12 sectors. The central angles of these sectors, measured in degrees, are all integers and they form an arithmetic sequence. What is the degree measure of the smallest possible sector angle?

$\textbf{(A)}\ 5\qquad\textbf{(B)}\ 6\qquad\textbf{(C)}\ 8\qquad\textbf{(D)}\ 10\qquad\textbf{(E)}\ 12$
## Solution 1
Let $a_1$ be the first term of the arithmetic progression and $a_{12}$ be the last term of the arithmetic progression. From the formula of the sum of an arithmetic progression (or arithmetic series), we have $\frac{a_1+a_{12}}{2}=360$, which leads us to $a_1 + a_{12} = 60. a_{12}$, the largest term of the progression, can also be expressed as $a_1+11d$, where $d$ is the common difference. Since each angle measure must be an integer, $d$ must also be an integer. We can isolate $d$ by subtracting $a_1$ from $a_{12}$ like so: $a_{12}-a_1=a_1+11d-a_1=11d$. Since $d$ is an integer, the difference between the first and last terms, $11d$, must be divisible by $11.$ Since the total difference must be less than $60$, we can start checking multiples of $11$ less than $60$ for the total difference between $a_1$ and $a_{12}$. We start with the largest multiple, because the maximum difference will result in the minimum value of the first term. If  the difference is $5$5, $a_\frac{60-55}{2}=2.5$, which is not an integer, nor is it one of the five options given. If the difference is $4$4, $a_\frac{60-44}{2}$, or $\boxed{\textbf{(C)}\ 8}$

*~Solution by Rhiju*
## Solution 2
If we let $a$ be the smallest sector angle and $r$ be the difference between consecutive sector angles, then we have the angles $a, a+r, a+2r, \cdots. a+11r$. Use the formula for the sum of an arithmetic sequence and set it equal to 360, the number of degrees in a circle.


$$\begin{align*} \frac{a+a+11r}{2}\cdot 12 &= 360\\
$2a+11$r &= 60\\
a &= $\frac{60-11r}{2} \end{align*}$


All sector angles are integers so $r$ must be a multiple of 2. Plug in even integers for $r$ starting from 2 to minimize $a.$ We find this value to be 4 and the minimum value of $a$ to be $\frac{60-11(4)}{2} = \boxed{\textbf{(C)}\ 8}$
## Solution 3
Starting with the smallest term, $a - 5x \cdots a, a + x \cdots a + 6x$ where $a$ is the sixth term and $x$ is the difference. The sum becomes $12a + 6x = 360$ since there are $360$ degrees in the central angle of the circle. The only condition left is that the smallest term in greater than zero. Therefore, $a - 5x > 0$.


$$2a + x = 60$$


$$x = 60 - 2a$$


$$a - 5(60 - 2a) > 0$$


$$11a > 300$$


Since $a$ is an integer, it must be $28$, and therefore, $x$ is $4$. $a - 5x$ is $\boxed{\textbf{(C)}\ 8}$
## Video Solution (CREATIVE THINKING)
https://youtu.be/1FyU20KeEKU

*~Education, the Study of Everything*
## See Also
