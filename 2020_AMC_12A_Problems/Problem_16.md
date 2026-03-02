# 2020 AMC 12A Problem 16

> This problem is the same as [2020 AMC 12A #16](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12A_Problems) and [2020 AMC 10A #16](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10A_Problems).
## Problem
A point is chosen at random within the square in the coordinate plane whose vertices are $(0, 0), (2020, 0), (2020, 2020),$ and $(0, 2020)$. The probability that the point is within $d$ units of a lattice point is $\tfrac{1}{2}$. (A point $(x, y)$ is a lattice point if $x$ and $y$ are both integers.) What is $d$ to the nearest tenth$?$


$\textbf{(A) } 0.3 \qquad \textbf{(B) } 0.4 \qquad \textbf{(C) } 0.5 \qquad \textbf{(D) } 0.6 \qquad \textbf{(E) } 0.7$
## Solutions
#### Diagram
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(5cm);
draw((0,0)--(1,0)--(1,1)--(0,1)--cycle);
filldraw((arc((0,0), 0.3989, 0, 90))--(0,0)--cycle, gray);
draw(arc((1,0), 0.3989, 90, 180));
filldraw((arc((1,0), 0.3989, 90, 180))--(1,0)--cycle, gray);
draw(arc((1,1), 0.3989, 180, 270));
filldraw((arc((1,1), 0.3989, 180, 270))--(1,1)--cycle, gray);
draw(arc((0,1), 0.3989, 270, 360));
filldraw(arc((0,1), 0.3989, 270, 360)--(0,1)--cycle, gray);
```

</asy>

The diagram represents each unit square of the given $2020 \times 2020$ square.
#### Solution 1
We consider an individual one-by-one block.

If we draw a quarter of a circle from each corner (where the lattice points are located), each with radius $d$, the area covered by the circles should be $0.5$. Because of this, and the fact that there are four circles, we write


$$4 \cdot \frac{1}{4} \cdot \pi d^2 = \frac{1}{2}$$


Solving for $d$, we obtain $d = \frac{1}{\sqrt{2\pi}}$, where with $\pi \approx 3$, we get $d \approx \frac{1}{\sqrt{6}} \approx \dfrac{1}{2.5} = \dfrac{10}{25} = \dfrac{2}{5}$, and from here, we see that $d \approx 0.4 \implies \boxed{\textbf{(B) } 0.4}.$

*~Crypthes*

*~Minor Edits by BakedPotato66*

$\textbf{Note:}$ To be more rigorous, note that $d<0.5$ since if $d\geq0.5$ then clearly the probability is greater than $\frac{1}{2}$. This would make sure the above solution works, as if $d\geq0.5$ there is overlap with the quartercircles. $\textbf{- Emathmaster}$
### Solution 2
As in the previous solution, we obtain the equation $4 \cdot \frac{1}{4} \cdot \pi d^2 = \frac{1}{2}$, which simplifies to $\pi d^2 = \frac{1}{2} = 0.5$. Since $\pi$ is slightly more than $3$, $d^2$ is slightly less than $\frac{0.5}{3} = 0.1\bar{6}$. We notice that $\bar{6}$ is slightly more than $0.4^2 = 0.16$, so $d$ is roughly $\boxed{\textbf{(B) } 0.4}.$ ~emerald_block
### Solution 3 (Estimating)
As above, we find that we need to estimate $d = \frac{1}{\sqrt{2\pi}}$.

Note that we can approximate $\pi \approx 6.28318 \approx 6.25$ and so $\frac{1}{\sqrt{2\pi}}\approx \frac{1}{\sqrt{6.25}}=\frac{1}{2.5}=0.4$.

And so our answer is $\boxed{\textbf{(B) } 0.4}$.

*~Silverdragon*
### Solution 4 (Estimating but a bit different)
We only need to figure out the probability for a unit square, as it will scale up to the $\times 2020$ square. Since we want to find the probability that a point inside a unit square that is $d$ units away from a lattice point (a corner of the square) is $\frac{1}{2}$, we can find which answer will come the closest to covering $\frac{1}{2}$ of the area.

Since the closest is $0.4$ which turns out to be $(0.4)^2\times \pi = 0.16 \times \pi$ which is about $0.502$, we find that the answer rounded to the nearest tenth is $0.4$ or $\boxed{\textbf{(B)}}$.

*~RuiyangWu*
### Solution 5 (Estimating but differently again)
As per the above diagram, realize that $\pi d^2 = \frac{1}{2}$, so $d = \frac{1}{(\sqrt{2})(\sqrt{\pi})}$.

$\sqrt{2} \approx 1.4 = \frac{7}{5}$.

$\sqrt{\pi}$ is between $1.7$ and $1.8((1.7)^2 = 2.89$ and $(1.8)^2 = 3.24)$, so we can say $\sqrt{\pi} \approx 1.75 = \frac{7}{4}$.

So $d \approx \frac{1}{(\frac{7}{5})(\frac{7}{4})} = \frac{1}{\frac{49}{20}} = \frac{20}{49}$. This is slightly above $\boxed{\textbf{(B) } 0.4}$, since $\frac{20}{49} \approx \frac{2}{5}$.

*~Solution by Joeya*
### Solution 6 (Estimating but differently again, again)
As above, we have the equation $\pi d^2 = \frac{1}{2}$, and we want to find the most accurate value of $d$. We resort to the answer choices and can plug those values of $d$ in and see which value of $d$ will lead to the most accurate value of $\pi$.

Starting off in the middle, we try option C with $d=0.5$. Plugging this in, we get $\pi \left(\frac{1}{2}\right)^2 = \frac{1}{2},$ and after simplifying we get $\pi = \frac{1}{2} \cdot 4 = 2.$
That's not very good. We know $\pi \approx 3.14.$

Let's see if we can do better. Trying option A with $d = 0.3,$ we get $\pi = \frac{1}{2} \cdot \frac{100}{9} = \frac{50}{9} = 5 \frac{5}{9}.$

Hm, let's try option B with $d = 0.4.$ We get $\pi = \frac{1}{2} \cdot \frac{25}{4} = \frac{25}{8} = 3 \frac{1}{8}$. This is very close to $\pi$ and is the best estimate for $\pi$ of the 5 options.

Therefore, the answer is $\boxed{\textbf{(B) } 0.4}.$
*~epiconan*
## Solution 7 (Sol. 1, but rigorous (and excessive))
PLEASE NOTE: Solution 1 IS rigorous. Say there are $k$ unit squares (it doesn't matter how many). There is a $\frac{1}k$ probability the point is in some unit square. There is a $\pi d^2$ probability the point is in the shaded region. So, there is a $\frac{1}k \pi d^2 \cdot k = \pi d^2$ probability the point is in any shaded region (since there are $k$ unit squares).

Let $n$ be the side length of a square. When $n=1$, the shaded areas represent half of the total area:
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(10cm);
draw((0,0)--(1,0)--(1,1)--(0,1)--cycle);
filldraw((arc((0,0), 0.3989, 0, 90))--(0,0)--cycle, gray);
draw(arc((1,0), 0.3989, 90, 180));
filldraw((arc((1,0), 0.3989, 90, 180))--(1,0)--cycle, gray);
draw(arc((1,1), 0.3989, 180, 270));
filldraw((arc((1,1), 0.3989, 180, 270))--(1,1)--cycle, gray);
draw(arc((0,1), 0.3989, 270, 360));
filldraw(arc((0,1), 0.3989, 270, 360)--(0,1)--cycle, gray);
```

</asy>

When $n=2$:
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(10cm);
filldraw((arc((0,0), 0.1994, 0, 90))--(0,0)--cycle, gray);
draw(arc((1,0), 0.1994, 90, 180));
filldraw((arc((1,0), 0.1994, 90, 180))--(1,0)--cycle, gray);
draw(arc((1,1), 0.1994, 180, 270));
filldraw((arc((1,1), 0.1994, 180, 270))--(1,1)--cycle, gray);
draw(arc((0,1), 0.1994, 270, 360));
filldraw(arc((0,1), 0.1994, 270, 360)--(0,1)--cycle, gray);
draw(arc((0.5,0.5), 0.1994,0,360));
filldraw(arc((0.5,0.5), 0.1994,0,360)--(0.5,0.5)--cycle, gray);
draw(arc((0.5,0), 0.1994,0,180));
filldraw(arc((0.5,0), 0.1994,0,180)--(0.5,0)--cycle, gray);
draw(arc((0,0.5), 0.1994,-90,90));
filldraw(arc((0,0.5), 0.1994,-90,90)--(0,0.5)--cycle, gray);
filldraw(arc((1,0.5), 0.1994,90,270)--(1,0.5)--cycle, gray);
filldraw(arc((0.5,1), 0.1994,0,-180)--(0.5,1)--cycle, gray);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(0.5,0)--(0.5,1)--(0,1)--(0,0)--(1,0)--(1,1)--(0,1)--(0,0.5)--(1,0.5));
```

</asy>

For $n=3$:


> [Asymptote diagram - not rendered in Markdown]

```asy
<asy>size(10cm);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw(arc((0,0),0.1330,0,90)--(0,0)--cycle, gray);
filldraw(arc((0,1),0.1330,-90,0)--(0,1)--cycle, gray);
filldraw(arc((1,0),0.1330,90,180)--(1,0)--cycle, gray);
filldraw(arc((1,1),0.1330,-180,-90)--(1,1)--cycle, gray);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw(arc((0.333,0.333),0.133,0,360)--(0.333,0.333)--cycle, gray);
filldraw(arc((0.667,0.333),0.133,0,360)--(0.667,0.333)--cycle, gray);
filldraw(arc((0.333,0.667),0.133,0,360)--(0.333,0.667)--cycle, gray);
filldraw(arc((0.667,0.667),0.133,0,360)--(0.667,0.667)--cycle, gray);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw(arc((0.333,0),0.133,0,180)--(0.333,0)--cycle, gray);
filldraw(arc((0.667,0),0.133,0,180)--(0.667,0)--cycle, gray);
filldraw(arc((0.333,1),0.133,-180,0)--(0.333,1)--cycle, gray);
filldraw(arc((0.666,1),0.133,-180,0)--(0.666,1)--cycle, gray);
filldraw(arc((0,0.333),0.133,-90,90)--(0,0.333)--cycle, gray);
filldraw(arc((0,0.667),0.133,-90,90)--(0,0.667)--cycle, gray);
filldraw(arc((1,0.333),0.133,90,270)--(1,0.333)--cycle, gray);
filldraw(arc((1,0.667),0.133,90,270)--(1,0.667)--cycle, gray);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(0,1)--(0.333,1)--(0.333,0)--(0.667,0)--(0.667,1)--(1,1)--(1,0)--(0,0)--(0,0.333)--(1,0.333)--(1,0.667)--(0,0.667));
draw((0.333,1)--(0.667,1));</asy>
```


We can calculate the total number of shaded circles given some $n$. There are $(n-1)^2$ full circles on the inside, $4(n-1)$ semicircles on the sides, and $4$ quarter circles for the corners.

Full circles are, of course, worth one circle. Semicircles are worth half a circle each, and quarter circles are worth $\dfrac14$ of a circle. Thus, weighing our sum gives $(n-1)^2+\dfrac{4(n-1)}2+\dfrac44=n^2-2n+1+2(n-1)+1=n^2-2n+2n+2-2=n^2.$ Thus, there is $n^2\cdot\pi r^2$ worth of the shaded area for any $n$, and since the area of each circle is $\pi r^2$ if $r$ is the radius of each.

We want the ratio of this shaded area to the entire to be $\dfrac12$. The area of the entire square is $n^2$, so dividing, we see that $\dfrac{n^2\cdot\pi r^2}{n^2}=\pi \dfrac12$.

The rest is the same as solution $1$.
## Video Solutions
### Video Solution 1
Education, The Study of Everything

https://youtu.be/napCkujyrac
### Video Solution 2
https://youtu.be/RKlG6oZq9so

*~IceMatrix*
### Video Solution 3
https://youtu.be/R220vbM_my8?t=238

*~amritvignesh0719062.0*
## See Also
