# 2020 AMC 12B Problem 25

## Problem
For each real number a with 0 $\leq$ a $\leq 1,$ let numbers x and y be chosen independently at random from the intervals [0, a] and [0, 1], respectively, and let P(a) be the probability that

$$\sin^2{(\pi x)} + \sin^2{(\pi y)} > 1$$
What is the maximum value of P(a)?

$\textbf{(A)}\ \frac{7}{12} \qquad\textbf{(B)}\ 2 - \sqrt{2} \qquad\textbf{(C)}\ \frac{1+\sqrt{2}}{4} \qquad\textbf{(D)}\ \frac{\sqrt{5}-1}{2} \qquad\textbf{(E)}\ \frac{5}{8}$
## Solution 1
Let's start first by manipulating the given inequality.


$$
\sin^{2}{(\pi x)}+\sin^{2}{(\pi y)}>1
\sin^{2}{(\pi x)}>1-\sin^{2}{(\pi y)}=\cos^{2}{(\pi y)}
$$


Let's consider the boundary cases: $\sin{(\pi x)}=\pm \cos{(\pi y)}.$

$$\sin{(\pi x)}=\pm \cos{(\pi y)}=\sin{(\tfrac 12 {\pi}\pm \pi y)}$$

Solving the first case gives us $y=\tfrac{1}{2}-x \quad \textrm{and} \quady=x-\tfrac{1}{2}.$ Solving the second case gives us $y=x+\tfrac{1}{2}\quad \textrm{and} \quady=\tfrac{3}{2}-x.$ If we graph these equations in [0,1]$\times$[0,1], we get a rhombus shape.

> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(fontsize(9)+0.8); size(200); pen p=fontsize(10); pair A,B,C,D,A1,A2,B1,B2,C1,C2,D1,D2,I,L; A=MP("(0,0)",origin,down+left,p); B=MP("(1,0)",right,down+right,p); C=MP("(1,1)",right+up,up+right,p); D=MP("(0,1)",up,up+left,p); A1=MP("",extension(A,B,(0.5,0),(0,0.5)),2*down,p); dot(A1); A2=MP("",extension(A,D,(0.5,0),(0,0.5)),2*left,p); dot(A2); B1=MP("",extension(B,C,(0.5,0),(0,-0.5)),2*right,p); dot(B1); B2=MP("",extension(C,D,(0.5,1),(0,0.5)),2*up,p); dot(B2); real $a=0.7$; draw(A1--B1--B2--A2--cycle, gray+0.6); draw(a*right--a*right+up, royalblue); draw(A1--B2, royalblue+dashed); draw(A--B--C--D--A, black+1.2); dot("$(a,0)$",(a,0),down); dot("$(a,1)$",(a,1),up);
```

Testing points in each section tells us that the inside of the rhombus satisfies the inequality in the problem statement.

From the region graph, notice that in order to maximize P(a), $a\geq\tfrac{1}{2}.$ We can solve the rest with geometric probability.

Instead of maximizing P(a), we minimize $Q(a)=1-$P(a). Q(a) consists of two squares (each broken into two triangles), one of area $\tfrac{1}{4}$ and another of area ($a-\tfrac 12)^2.$ To calculate Q(a), we divide this area by a, so Q(a) = $\frac{1}{a}\left(\frac{1}{4}+(a-\tfrac 12)^2\right) = \frac{1}{a}\left(\frac{1}{2}+a^2-a\right)=a+\frac 1{2a}-1.$

By AM-GM, $a+\frac{1}{2a}\geq 2\sqrt{\frac{a}{2a}}=\sqrt{2},$ which we can achieve by setting $a=\frac{\sqrt{2}}{2}.$

Therefore, the maximum value of P(a) is $1-\min(Q(a)),$ which is 1-($\sqrt{2}-1) =\boxed{\textbf{(B)}\ 2 - \sqrt{2}}$
## Solution 2 (Trigonometry Identities)

$$\sin^2{(\pi x)} + \sin^2{(\pi y)} > 1, \quad \sin^2{(\pi x)} - (1 - \sin^2{(\pi y)} ) > 0, \quad \sin^2{(\pi x)} - \cos^2{(\pi y)} > 0$$


$$( \sin{(\pi x)} + \cos{(\pi y)} )(\sin{(\pi x)} - \cos{(\pi y)})> 0, \quad \left( \sin{(\pi x)} + \sin{( \frac{\pi}{2} - \pi y)} \right) \left( \sin{(\pi x)} - \sin{(\frac{\pi}{2} - \pi y)} \right)> 0$$


$$2\sin{\left( \frac{ \pi x + \frac{\pi}{2} - \pi y }{2} \right)} \cos{\left( \frac{ \pi x - \frac{\pi}{2} + \pi y }{2} \right)} 2 \sin{\left( \frac{ \pi x - \frac{\pi}{2} + \pi y }{2} \right)} \cos{\left( \frac{ \pi x + \frac{\pi}{2} - \pi y }{2} \right)} > 0$$


$$2\sin{\left( \frac{ \pi x + \frac{\pi}{2} - \pi y }{2} \right)} \cos{\left( \frac{ \pi x + \frac{\pi}{2} - \pi y }{2} \right)} 2 \sin{\left( \frac{ \pi x - \frac{\pi}{2} + \pi y }{2} \right)} \cos{\left( \frac{ \pi x - \frac{\pi}{2} + \pi y }{2} \right)} > 0$$


$$\sin{\left(\pi x + \frac{\pi}{2} - \pi y\right)} \sin{\left( \pi x - \frac{\pi}{2} + \pi y \right)} > 0$$


If $\sin{\left(\pi x + \frac{\pi}{2} - \pi y\right)} > 0$ and  $\sin{\left( \pi x - \frac{\pi}{2} + \pi y \right)} > 0$

0 < $\pi$ x + $\frac{\pi}{2} - \pi$ y < $\pi \quad \text{and} \quad 0 < \pi$ x - $\frac{\pi}{2} + \pi$ y < $\pi$

0 < x + $\frac{1}{2} -$ y < 1 $\quad \text{and} \quad 0 <$ x - $\frac{1}{2} +$ y < 1

x - $\frac{1}{2} <$ y < x + $\frac{1}{2} \quad \text{and} \quad -x + \frac{1}{2} <$ y < -x + $\frac{3}{2}$

If $\sin{\left(\pi x + \frac{\pi}{2} - \pi y\right)} < 0$ and  $\sin{\left( \pi x - \frac{\pi}{2} + \pi y \right)} < 0$

$\pi < \pi$ x + $\frac{\pi}{2} - \pi$ y < $2\pi \quad \text{and} \quad \pi < \pi$ x - $\frac{\pi}{2} + \pi$ y < $2\pi$

1 < x + $\frac{1}{2} -$ y < 2 $\quad \text{and} \quad 1 <$ x - $\frac{1}{2} +$ y < 2

 x - $\frac{3}{2} <$ y < x - $\frac{1}{2} \quad \text{and} \quad -x + \frac{3}{2} <$ y < -x + $\frac{5}{2}$

Notice that $\sin{\left(\pi x + \frac{\pi}{2} - \pi y\right)} < 0$ and  $\sin{\left( \pi x - \frac{\pi}{2} + \pi y \right)} < 0$  cannot be true, because that means x is in the interval [1, 2]. Thus, y is in the the boundaries x - $\frac{1}{2} <$ y < x + $\frac{1}{2},$ and -x + $\frac{1}{2} <$ y < -x + $\frac{3}{2}.$

Finishing like Solution 1, 3, or 4 gives P(a) =$\boxed{\textbf{(B)}\ 2 - \sqrt{2}}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 3 (Calculus finish)
We find the same region as in the first solution or the second solution, and again notice we must have a $\geq \frac{1}{2}.$

We now express P as a function of b=(1-a). The triangle on the right of the line x=b is an isosceles right triangle with altitude b, so it has area $b^2.$ The total area of the region to the left of x=b has area 1-b. So
$$P(b) = \frac{1/2 - b^2}{1-b}$$
Differentiating using the quotient rule, we find P has local extrema at
$$P'(b) = \frac{(1-h)(-2h)-(-1/2 - h^2)(-1)}{(1-h)^2} = 0$$
Setting the numerator equal to 0 and solving the quadratic, we find P has extrema at $b = 1\pm \frac{\sqrt{2}}{2}.$ Only $b=1-\frac{\sqrt 2}{2}$ is within the desired region. Plugging in, we get P($1-\frac{\sqrt 2}{2}) = \boxed{\textbf{(B)}\ 2 - \sqrt{2}}$ as our solution. We also need to check P$(b=0) = 1/$2. But 1/$2 < 2-\sqrt{2},$ and if this isn't immediately obvious, 1/2 isn't an answer choice anyways.

*~jd9 (AMGM scary)*
## Solution 4 (Calculus Finish)
We find the same region as in the first solution or the second solution, and again notice a $\geq \frac{1}{2}.$

The numerator of P(a) is the area of the triangle with vertices (0, $\frac12), (\frac12, 0), (\frac12, 1)$ plus the area of the rectangle with vertices ($\frac12,0), (a,0), (a,1), (\frac12,1)$ subtract the area of the isosceles right triangle between x=a, $y=0,x - \frac{1}{2}$ and the isosceles right triangle between x=a, $y=1, -x + \frac{3}{2}.$ The denominator of P(a) is the area of rectangle with vertices (0,0), (a,0), (a,1), (0,1).


$$P(a) = \frac{ \frac14 + a - \frac12 -(a - \frac12)^2 }{a} = \frac{a - \frac14 -a^2 + a - \frac14 }{a} = \frac{-a^2 + 2a - \frac12 }{a} = -a + 2 - \frac{1}{2a}$$


By the power rule, P'(a) = -1 - $\frac12(-1)\frac{1}{a^2} = -1 + \frac{1}{2a^2}.$ Solving P'(a) = 0, we find that $a =\frac{ \sqrt{2} }{2}$


$$\because P'(a) = 0 when a = \frac{ \sqrt{2} }{2}, P'(a) is positive when a < \frac{ \sqrt{2} }{2}, and P'(a) is negative when a > \frac{ \sqrt{2} }{2}$$


$$\therefore P(a) has a local maximum when a = \frac{ \sqrt{2} }{2}.$$


$$P(\frac{ \sqrt{2} }{2}) = - \frac{\sqrt{2} }{2} + 2 - \frac{1}{2 \cdot \frac{\sqrt{2} }{2}} =\boxed{\textbf{(B)}\ 2 - \sqrt{2}}$$


~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 5 (Calculus)
Comparing the diagram of $\sin^{2}{(\pi x)}$ and $\cos^{2}{(\pi y)},$ we can see if we let x=k, then $y\in (0+$\lvert $\dfrac{1}{2}-k$\rvert,1-\lvert$\dfrac{1}{2}-k$\rvert) will satisfy the above inequality.

Thus, we can write that

$$
P(a) = \frac{1}{a} (\int_0^{a}1-2\lvert\frac{1}{2}-x\rvert{\rm d}x)
P(a) = \frac{1}{a} (\int_0^{\frac{1}{2}}2x{\rm d}x + \int_{\frac{1}{2}}^{a}2-2x{\rm d}x) = -a+2-\frac{1}{2a}
$$


Then it is easy to find that P(a) is maximized when $a=\dfrac{\sqrt{2}}{2},$ which give us P($\dfrac{\sqrt{2}}{2})=\boxed{\textbf{(B)}\ 2 - \sqrt{2}}$

*~ERiccc*
## Video Solution by MOP 2024
https://youtube.com/watch?v=qcyHncpasls
## Video Solution by On The Spot STEM
https://www.youtube.com/watch?v=5goLUdObBrY
## See Also
