# 2019 AMC 12A Problem 8

> This problem is the same as [2019 AMC 10A #14](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10A_Problems) and [2019 AMC 12A #8](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12A_Problems).
## Problem
For a set of four distinct lines in a plane, there are exactly $N$ distinct points that lie on two or more of the lines. What is the sum of all possible values of $N$?

$\textbf{(A) } 14 \qquad \textbf{(B) } 16 \qquad \textbf{(C) } 18 \qquad \textbf{(D) } 19 \qquad \textbf{(E) } 21$
## Solution
It is possible to obtain $0$, $1$, $3$, $4$, $5$, and $6$ points of intersection, as demonstrated in the following figures:


<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(2cm);
real $d = 2.5$;
draw((-1,.6)--(1,.6),Arrows);
draw((-1,.2)--(1,.2),Arrows);
draw((-1,-.2)--(1,-.2),Arrows);
draw((-1,-.6)--(1,-.6),Arrows);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((-1+d,0)--(1+d,0),Arrows);
draw((0+d,1)--(0+d,-1),Arrows);
draw(dir(45)+(d,0)--dir(45+180)+(d,0),Arrows);
draw(dir(135)+(d,0)--dir(135+180)+(d,0),Arrows);
dot((0+d,0));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((-1+2*d,sqrt(3)/3)--(1+2*d,sqrt(3)/3),Arrows);
draw((-1/4-1/2+2*d, sqrt(3)/12-sqrt(3)/2)--(-1/4+1/2+2*d,sqrt(3)/12+sqrt(3)/2),Arrows);
draw((1/4+1/2+2*d, sqrt(3)/12-sqrt(3)/2)--(1/4-1/2+2*d,sqrt(3)/12+sqrt(3)/2),Arrows);
draw((-1+2*d,-sqrt(3)/6)--(1+2*d,-sqrt(3)/6),Arrows);
```

dot((0+2*d,sqrt(3)/3));
dot((-1/2+2*d,-sqrt(3)/6));
dot((1/2+2*d,-sqrt(3)/6));


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((-1/3,1-d)--(-1/3,-1-d),Arrows);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((1/3,1-d)--(1/3,-1-d),Arrows);
draw((-1,-1/3-d)--(1,-1/3-d),Arrows);
draw((-1,1/3-d)--(1,1/3-d),Arrows);
dot((1/3,1/3-d));
dot((-1/3,1/3-d));
dot((1/3,-1/3-d));
dot((-1/3,-1/3-d));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((-1+d,sqrt(3)/12-d)--(1+d,sqrt(3)/12-d),Arrows);
draw((-1/4-1/2+d, sqrt(3)/12-sqrt(3)/2-d)--(-1/4+1/2+d,sqrt(3)/12+sqrt(3)/2-d),Arrows);
draw((1/4+1/2+d, sqrt(3)/12-sqrt(3)/2-d)--(1/4-1/2+d,sqrt(3)/12+sqrt(3)/2-d),Arrows);
draw((-1+d,-sqrt(3)/6-d)--(1+d,-sqrt(3)/6-d),Arrows);
```

dot((0+d,sqrt(3)/3-d));
dot((-1/2+d,-sqrt(3)/6-d));
dot((1/2+d,-sqrt(3)/6-d));
dot((-1/4+d,sqrt(3)/12-d));
dot((1/4+d,sqrt(3)/12-d));


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((-1/4-1/2+2*d, sqrt(3)/12-sqrt(3)/2-d)--(-1/4+1/2+2*d,sqrt(3)/12+sqrt(3)/2-d),Arrows);
draw((1/4+1/2+2*d, sqrt(3)/12-sqrt(3)/2-d)--(1/4-1/2+2*d,sqrt(3)/12+sqrt(3)/2-d),Arrows);
draw(dir(30)+(2*d,-d)--dir(30+180)+(2*d,-d),Arrows);
draw(dir(150)+(2*d,-d)--dir(-30)+(2*d,-d),Arrows);
dot((0+2*d,0-d));
```

dot((0+2*d,sqrt(3)/3-d));
dot((-1/2+2*d,-sqrt(3)/6-d));
dot((1/2+2*d,-sqrt(3)/6-d));
dot((-1/4+2*d,sqrt(3)/12-d));
dot((1/4+2*d,sqrt(3)/12-d));
</asy>

It is clear that the maximum number of possible intersections is ${4 \choose 2} = 6$, since each pair of lines can intersect at most once. In addition, by looking at the answer choices, we know that we cannot have 7 points of intersection or else our answer would be greater than the given answer choices. Our answer is given by the sum $\boxed{\textbf{(D)} 19}$.
## Video Solution 1
https://youtu.be/-0s2xGhU8wM

*~Education, the Study of Everything*
## See Also
