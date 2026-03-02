# 2021 AMC 12A Problem 16

> This problem is the same as [2021 AMC 10A #16](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10A_Problems/Problem_16) and [2021 AMC 12A #16](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12A_Problems/Problem_16).
## Problem
In the following list of numbers, the integer n appears n times in the list for 1 $\leq$ n $\leq 200.1, 2, 2, 3, 3, 3, 4, 4, 4, 4, \ldots, 200, 200, \ldots$ , 200What is the median of the numbers in this list?

$\textbf{(A)} ~100.5 \qquad\textbf{(B)} ~134 \qquad\textbf{(C)} ~142 \qquad\textbf{(D)} ~150.5 \qquad\textbf{(E)} ~167$
## Solution 1
There are $1+2+..+199+200=\frac{(200)(201)}{2}=20100$ numbers in total. Let the median be k. We want to find the median k such that
$$\frac{k(k+1)}{2}=20100/2,$$
or
$$k(k+1)=20100.$$
Note that $\sqrt{20100} \approx 142.$ Plugging this value in as k gives
$$\frac{1}{2}(142)(143)=10153.$$
10153-$142<10050$, so 142 is the 152nd and 153rd numbers, and hence, our desired answer. \fbox{(C) 142}.

Note that we can derive $\sqrt{20100} \approx 142$ through the formula $\sqrt{n} = \sqrt{a+b} \approx \sqrt{a} + \frac{b}{2\sqrt{a} + 1},$
where a is a perfect square less than or equal to n. We set a to 19600, so $\sqrt{a} = 140,$ and $b = 500$. We then have n $\approx 140 + \frac{500}{2(140)+1} \approx 142.$ ~approximation by ciceronii

Note by Fasolinka (use answer choices): Once you know that the answer is in the $140s$ range (200,000 is around $14^2$ times $10^2)$ by the approximation, it is highly improbable for the answer to be anything but C.
## Solution 2
The xth number of this sequence is $\left\lceil\frac{-1\pm\sqrt{1+8x}}{2}\right\rceil$ via the quadratic formula. We can see that if we halve x we end up getting $\left\lceil\frac{-1\pm\sqrt{1+4x}}{2}\right\rceil.$ This is approximately the number divided by $\sqrt{2}. \frac{200}{\sqrt{2}} = 141.4$ and since 142 looks like the only number close to it, it is answer $\boxed{(C) 142}$ ~Lopkiloinm
## Solution 3 (Answer Choices)
We can look at answer choice $\textbf{(C)},$ which is 142 first. That means that the number of numbers from 1 to 142 is roughly the number of numbers from 143 to 200.

The number of numbers from 1 to 142 is $\frac{142(142+1)}{2}$ which is approximately 10000. The number of numbers from 143 to 200 is $\frac{200(200+1)}{2}-\frac{142(142+1)}{2}$ which is approximately 10000 as well. Therefore, we can be relatively sure the answer choice is $\boxed{\textbf{(C)} ~142}.$

*~PureSwag*
## Solution 4 (Geometry)
We can arrange the numbers in the following pattern:
$$\begin{array}{cccccc} \ &\ &\ &\ &\ 200 & \\ \ &\ &\ &\ 199 & \ 200 & \\ \ &\ &\ \iddots& \ \vdots& \ \vdots& \\ \ &\ 2& \ \cdots& \ 199& \ 200& \\ 1 & \ 2 & \ \cdots& \ 199& \ 200& \end{array}$$

We can see this as a isosceles right triangle, with legs of length 200.

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(200,200)--(200,0)--cycle); draw((142,0)--(142,142)); label("$x$",(142,0)--(142,142),E); label("$x$",(0,0)--(142,0),S); label("$200$",(200,0)--(200,200),E);
```


Let x be the side length such that both sides of the triangle have the same area. The desired answer is then around x because about half of the numbers in the list fall on each side.

Solving for x yields:

$$
\begin{align*} \frac{x^2}{2} =& \:\frac{1}{2} \cdot \frac{200^2}{2} \\ x^2 =& \:\frac{1}{2}\cdot 200^2 \\ x =& \:\frac{200}{\sqrt{2}} = \: 100\sqrt{2} \approx 141. \end{align*}
$$

We see that $\boxed{(C) \: 142}$ is the closest to x by far, and thus, can be relatively certain this is the answer.

*~thinker123*
## Video Solution by Punxsutawney Phil
https://youtube.com/watch?v=vsE_ezaV4Xs
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=AjQARBvdZ20
## Video Solution by Answer Choice
https://www.youtube.com/watch?v=YxWjDcUcaeQ&list=PLexHyfQ8DMuKqltG3cHT7Di4jhVl6L4YJ&index=13
*~North America Math Contest Go Go Go*
## Video Solution by OmegaLearn (Using Algebra)
https://youtu.be/HkwgH9Lc1hE

*~pi_is_3.14*
## Video Solution by TheBeautyofMath
https://youtu.be/CTXQunZpBA4

*~IceMatrix*
## See also
