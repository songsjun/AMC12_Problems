# 2013 AMC 12A Problem 1

## Problem
Square  ABCD  has side length  10 . Point  E  is on  $\overline{BC}$ , and the area of  \bigtriangleup ABE  is  40 . What is  BE ?


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A,B,C,D,E; A=(0,0); B=(0,50); C=(50,50); D=(50,0); E = (40,50); draw(A--B); draw(B--E); draw(E--C); draw(C--D); draw(D--A); draw(A--E); dot(A); dot(B); dot(C); dot(D); dot(E); label("A",A,SW); label("B",B,NW); label("C",C,NE); label("D",D,SE); label("E",E,N);
```


$\textbf{(A)} \ 4 \qquad \textbf{(B)} \ 5 \qquad \textbf{(C)} \ 6 \qquad \textbf{(D)} \ 7 \qquad \textbf{(E)} \ 8 \qquad$
## Solution
We are given that the area of $\triangle ABE$ is 40, and that AB = 10.

The area of a triangle is:

$$A = \frac{bh}{2}$$

Using AB as the height of $\triangle ABE,$

$$40 = \frac{10b}{2}$$

and solving for b,

$b = 8$, which is $\boxed{\textbf{(E)}}$
## Video Solution (CREATIVE THINKING)
https://youtu.be/wW_GidbHnnM

*~Education, the Study of Everything*
## Video Solution
https://www.youtube.com/watch?v=2vf843cvVzo?t=0
*~sugar_rush*
## See also
