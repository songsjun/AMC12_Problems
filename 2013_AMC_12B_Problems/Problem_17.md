# 2013 AMC 12B Problem 17

## Problem
Let a,b, and c be real numbers such that

a+b+$c=$2, $\text{ and}$
$$a^2+b^2+c^2=12$$

What is the difference between the maximum and minimum possible values of c?


$$\text{(A) }2\qquad \text{ (B) }\frac{10}{3}\qquad \text{ (C) }4 \qquad \text{ (D) }\frac{16}{3}\qquad \text{ (E) }\frac{20}{3}$$

## Solution 1
Note that a+$b= 2$-c. Now, by [Cauchy-Schwarz](https://artofproblemsolving.com/wiki/index.php/Cauchy-Schwarz), we have that $(a^2+b^2)\ge \frac{(2-c)^2}{2}.$ Therefore, we have that $\frac{(2-c)^2}{2}+c^2 \le 12.$ We then find the roots of c that satisfy equality and find the difference of the roots. This gives the answer, $\boxed{\textbf{(D)} \ \frac{16}{3}}.$

Note: We arrived at $(a^2+b^2)\ge \frac{(2-c)^2}{2}$ as we consider the two sets of numbers (a,b) and (1,1). From [Cauchy-Schwarz](https://artofproblemsolving.com/wiki/index.php/Cauchy-Schwarz), we have that $(a^2+b^2)(1^2+1^2)\ge (2\cdot 1 -c\cdot 1)^2.$ a+$b = 2$-c which is how we got the second part of the inequality.

*~minor edit by Yiyj1*
## Solution 2
This is similar to the first solution but is far more intuitive. From the given, we have  a + $b = 2$ - c a^2 + b^2 = 12 - c^2  This immediately suggests use of the Cauchy-Schwarz inequality. By Cauchy, we have  2\$,(a^2 + b^2)\geq (a + b)^2$ Substitution of the above results and some algebra yields  $3c^2-4c - $20 $\leq 0$  This quadratic inequality is easily solved, and it is seen that equality holds for c = -2 and $c =\frac{10}{3}.$

The difference between these two values is  $\boxed{\textbf{(D)} \ \frac{16}{3}}.$
## Solution 3 (no [Cauchy-Schwarz](https://artofproblemsolving.com/wiki/index.php/Cauchy-Schwarz))
From the first equation, we know that $c=2$-a-b. We substitute this into the second equation to find that
$$a^2+b^2+(2-a-b)^2=12.$$
This simplifies to $2a^2+2b^2-4a-4b+2$ab=8, which we can write as the quadratic $a^2+(b-2)a+(b^2-2b-4)=0$. We wish to find real values for a and b that satisfy this equation. Therefore, the discriminant is nonnegative. Hence,
$$(b-2)^2-4(b^2-2b-4)\ge0,$$
or -$3b^2+4b+20\ge 0.$ This factors as -$(3b-10)(b+2)\ge 0.$ Therefore, $-2\leb\le \frac{10}{3},$ and by symmetry this must be true for a and c as well.

Now $a=b=2$ and c=-2 satisfy both equations, so we see that c=-2 must be the minimum possible value of c. Also, $c=\frac{10}{3}$ and $a=b=-\frac{2}{3}$ satisfy both equations, so we see that $c=\frac{10}{3}$ is the maximum possible value of c. The difference between these is $\frac{10}{3}-(-2)=\frac{16}{3},$ or $\boxed{\textbf{(D)}}.$
## Solution 4 (geometrical approach)
From the given, we have  a + $b = 2$ - c and $a^2 + b^2 = 12 - c^2 .$ The first equation is a line with x and y intercepts of 2-c and the second equation is a circle centered at the origin with radius $\sqrt{12-c^2}.$ Intuitively, if we want to find the minimum / maximum c such that there still exist real solutions, the two graphs of the equations should be tangent.

Thus, we have that $\sqrt{2} \cdot \sqrt{12-c^2} = 2-c,$ which simplifies to $3c^2-4c-20=0$. Solving the quadratic, we get that the values of c for which the two graphs are tangent are c=-2 and $c=\frac{10}{3}.$ Thus, our answer is $\boxed{\frac{16}{3}}.$
## Solution 5
Draw the sphere and the plane represented by the two equations in Cartesian space, with the z-axis representing c. The intersection between the sphere and plane is a circle. We wish to find the point on the circle where z is minimized and the point where z is maximized.
Looking at the graph, it is clear by symmetry that x = y when z is maximized or minimized. Thus, we can set a = b. This gives us the following system of equations:

$$2a + c = 2$$

$$2a^2 + c^2 = 12$$

Solving gives c = $\frac{10}{3}, -2,$ which are the maximum and minimum values of c respectively. The answer follows from here.
## Solution 6
We can consider a, b, and c to be solutions to a cubic equation. Then, given our information, we have a+b+$c=2$ and ab+ac+bc=-4, so our cubic equation looks like this: $x^3-2x^2-4x$+m where m can be any real number.

Since this cubic has 3 real solutions, it must have both a maximum and a minimum (noticed by looking at the graph). Then the greatest solution is maximized when the other two solutions are the same and is minimized when the other two solutions are the same.

Thus, equating a and b, we have $2a$+c=2and2a^2+c^2=12Solving this, we get the quadratic $3c^2-4c+4=24 \Rightarrowc=\frac{10}{3}, -2$implying the answer.
## Solution 7
Subtracting c from the first equation yields a+$b=2$-c. Subtracting c^2 from the second equation yields a^2+b^2=12-c^2. Thus we have the equations

$$
\begin{cases} a+b=2-c\\ a^2+b^2=12-c^2\\ \end{cases}
$$

Squaring the first equation yields $a^2+2ab+b^2=4-4c$+c^2 Subtracting the second equation from this one yields $2ab=2c^2-4c-8\iffab=c^2-2c-4$ Thus we have the system of equations

$$
\begin{cases} a+b=2-c\\ ab=c^2-2c-4\\ \end{cases}
$$

We can reverse [Vieta's Formulas](https://artofproblemsolving.com/wiki/index.php/Vieta's_Formulas), to get that a and b are roots of the quadratic equation(in x) x^2-(2-c)x+(c^2-$2c-4$). Because we have a, $b\in \mathbb{R},$ we have that the discriminant of this quadratic equation must be nonnegative. The discriminant is $(2-c)^2-4(c^2-2c-4)=-3c^2+4c+20$, and it can be factored as -$3(c+2)($c-\frac{10}{2})$.$ Since we have -$3(c+2)($c-\frac{10}{2})$\geq 0,$ we must have ($c+2)(c-\frac{10}{2})\leq 0.$ If c<-2, then we have that ($c+2)(c-\frac{10}{2})>0.$ If c=-2, then ($c+2)(c-\frac{10}{2})=0.$ If $c\in (-2, \frac{10}{3}),$ then ($c+2)(c-\frac{10}{2})<0.$ If $c=\frac{10}{3},$ then ($c+2)(c-\frac{10}{2})=0.$ If c>$\frac{10}{3},$ then ($c+2)(c-\frac{10}{2})>0.$ Thus our inequality holds if and only if $c\in \left$ [-2, $\frac{10}{3}\right$], and the maxmimum value is $\frac{10}{3},$ whilst the minimum value is -2. Thus the difference between the maximum and minimum values is $\frac{10}{3}-(-2)=\boxed{\textbf{(D)} \frac{16}{3}}$

*~vsamc*
## See also
